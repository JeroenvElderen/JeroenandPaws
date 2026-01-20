const { supabaseAdmin, requireSupabase, saveBookingCalendarEventId } = require("./_lib/supabase");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { createEvent, updateEvent, deleteEvent } = require("./_lib/graph");
const {
  buildCalendarBody,
  buildCalendarSubject,
  buildCalendarCategories,
  resolveCalendarLocationDisplayName,
} = require("./_lib/calendar-events");

const isAdmin = (req) => {
  const adminEmail = process.env.ADMIN_EMAIL || "jeroen@jeroenandpaws.com";
  const headerEmail = (req.headers["x-admin-email"] || "").toLowerCase();
  return headerEmail && headerEmail === adminEmail.toLowerCase();
};

const resolveShowAs = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pending") return "tentative";
  if (normalized === "rescheduled") return "busy";
  if (normalized === "confirmed" || normalized === "scheduled") return "busy";
  return undefined;
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  if (!isAdmin(req)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Admin email required" }));
    return;
  }

  try {
    requireSupabase();

    const { id } = req.body || {};
    if (!id) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Booking id is required" }));
      return;
    }

    // ✅ Correct schema-aware query
    const bookingResult = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        status,
        calendar_event_id,
        service_title,
        start_at,
        end_at,
        time_zone,
        client_address,
        notes,
        payment_link,
        client:clients (
          full_name,
          phone_number,
          email
        ),
        booking_pets (
          pets (
            id,
            name,
            breed,
            notes,
            photo_data_url
          )
        )
      `)
      .eq("id", id)
      .single();

    if (bookingResult.error) {
      console.error("Booking fetch error:", bookingResult.error);
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          message: "Booking not found",
          bookingId: id,
          error: bookingResult.error.message,
        })
      );
      return;
    }

    const booking = bookingResult.data;

    // ✅ Normalize client
    booking.client_name = booking.client?.full_name || null;
    booking.client_phone = booking.client?.phone_number || null;
    booking.client_email = booking.client?.email || null;
    delete booking.client;

    // ✅ Normalize pets
    booking.pets = (booking.booking_pets || [])
      .map((bp) => bp.pets)
      .filter(Boolean);
    delete booking.booking_pets;

    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    if (!calendarId) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Missing Outlook calendar configuration" }));
      return;
    }

    const accessToken = await getAppOnlyAccessToken();
    const normalizedStatus = String(booking.status || "").toLowerCase();

    // ❌ Cancelled → delete
    if (["cancelled", "canceled"].includes(normalizedStatus)) {
      if (booking.calendar_event_id) {
        await deleteEvent({
          accessToken,
          calendarId,
          eventId: booking.calendar_event_id,
        });
      }

      await supabaseAdmin
        .from("bookings")
        .update({ calendar_event_id: null })
        .eq("id", booking.id);

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ booking, action: "deleted" }));
      return;
    }

    const locationDisplayName = resolveCalendarLocationDisplayName({
      clientAddress: booking.client_address,
    });

    const calendarPayload = {
      subject: buildCalendarSubject({
        serviceTitle: booking.service_title,
        status: normalizedStatus || "confirmed",
      }),
      body: {
        contentType: "Text",
        content: buildCalendarBody({
          serviceTitle: booking.service_title,
          status: normalizedStatus || "confirmed",
          paymentLink: booking.payment_link,
          clientName: booking.client_name,
          clientPhone: booking.client_phone,
          clientEmail: booking.client_email,
          clientAddress: booking.client_address,
          notes: booking.notes,
          pets: booking.pets,
        }),
      },
      start: {
        dateTime: booking.start_at,
        timeZone: booking.time_zone || "UTC",
      },
      end: {
        dateTime: booking.end_at,
        timeZone: booking.time_zone || "UTC",
      },
      categories: buildCalendarCategories({
        status: normalizedStatus || "confirmed",
        serviceTitle: booking.service_title,
      }),
      ...(locationDisplayName ? { location: { displayName: locationDisplayName } } : {}),
      ...(resolveShowAs(normalizedStatus)
        ? { showAs: resolveShowAs(normalizedStatus) }
        : {}),
    };

    if (booking.calendar_event_id) {
      await updateEvent({
        accessToken,
        calendarId,
        eventId: booking.calendar_event_id,
        updates: calendarPayload,
      });

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ booking, action: "updated" }));
      return;
    }

    const createdEvent = await createEvent({
      accessToken,
      calendarId,
      subject: calendarPayload.subject,
      body: calendarPayload.body.content,
      bodyContentType: calendarPayload.body.contentType,
      start: booking.start_at,
      end: booking.end_at,
      timeZone: booking.time_zone || "UTC",
      locationDisplayName,
      categories: calendarPayload.categories,
      showAs: calendarPayload.showAs,
    });

    if (createdEvent?.id) {
      await saveBookingCalendarEventId(booking.id, createdEvent.id);
    }

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        booking,
        action: "created",
        calendarEventId: createdEvent?.id || null,
      })
    );
  } catch (error) {
    console.error("Manual calendar sync failed", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: "Failed to sync calendar event" }));
  }
};
