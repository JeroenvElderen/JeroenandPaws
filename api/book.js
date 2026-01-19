const { DateTime } = require("luxon");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { createEvent, sendMail } = require("./_lib/graph");
const {
  createBookingWithProfiles,
  findAdjacentBookings,
  resolveBookingTimes,
  saveBookingCalendarEventId,
} = require("./_lib/supabase");
const { DEFAULT_HOME_ADDRESS, validateTravelWindow } = require("./_lib/travel");

const {
  buildConfirmationBody,
  buildNotificationBody,
  buildConfirmationSubject,
} = require("./_lib/confirmation-email");

const ADDITIONAL_LABELS = {
  feeding: "Feeding & fresh water",
  meds: "Medication support",
  enrichment: "Enrichment time",
  cleanup: "Accident clean-up",
  "house-care": "House touches",
};

const resolveCalendarEmail = (calendarId) =>
  process.env.NEXT_PUBLIC_OUTLOOK_CALENDAR_EMAIL?.trim() ||
  process.env.OUTLOOK_SENDER_EMAIL?.trim() ||
  calendarId;

const resolveNotificationEmail = (calendarId) =>
  process.env.CONTACT_NOTIFICATION_EMAIL ||
  process.env.NOTIFY_EMAIL ||
  process.env.JEROEN_AND_PAWS_EMAIL ||
  process.env.ADMIN_EMAIL ||
  resolveCalendarEmail(calendarId);

const PENDING_PAYMENT_CATEGORY =
  process.env.OUTLOOK_PENDING_PAYMENT_CATEGORY || "Pending payment";

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

const WINDOWS_TO_IANA = {
  "GMT Standard Time": "Europe/London",
};

const resolveTimeZone = (timeZone = "UTC") => {
  const candidate = WINDOWS_TO_IANA[timeZone] || timeZone;
  return DateTime.now().setZone(candidate).isValid ? candidate : "UTC";
};

const buildFriendlyTiming = ({ start, end, timeZone = "UTC" }) => {
  const zone = resolveTimeZone(timeZone);
  const fmt = "cccc, LLLL d, yyyy 'at' t ZZZZ";

  const fix = (value) => {
    const dt = DateTime.isDateTime(value)
      ? value
      : DateTime.fromISO(String(value), { zone: "UTC" });
    return dt.setZone(zone).toFormat(fmt);
  };

  return { start: fix(start), end: fix(end), timeZone: zone };
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  try {
    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    let accessToken = null;
    const calendarEmail = resolveCalendarEmail(calendarId);

    if (calendarId) {
      try {
        accessToken = await getAppOnlyAccessToken();
      } catch (err) {
        console.error("Email auth error", err);
      }
    }

    const body = await parseBody(req);
    const {
      date,
      time,
      durationMinutes = 60,
      serviceId,
      serviceTitle,
      clientName,
      clientPhone,
      clientAddress,
      clientEmail,
      notes,
      timeZone = "UTC",
      pets = [],
      dogs = [],
      dogCount,
      schedule = [],
      recurrence = null,
      autoRenew = false,
      bookingMode,
      additionals = [],
      amount,
      payment_preference: paymentPreference,
    } = body;
    const paymentOrderId = body?.payment_order_id || null;

    if (!clientName || !clientPhone || !clientEmail || !clientAddress) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({ message: "Name, phone, email, and address required." })
      );
      return;
    }

    const preparedSchedule = (Array.isArray(schedule) ? schedule : [])
      .map((e) => ({
        date: e.date,
        time: e.time,
        durationMinutes: Number.isFinite(e.durationMinutes)
          ? e.durationMinutes
          : durationMinutes,
      }))
      .filter((e) => e.date && e.time);

    if (!preparedSchedule.length && date && time) {
      preparedSchedule.push({ date, time, durationMinutes });
    }

    if (!preparedSchedule.length) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Missing schedule" }));
      return;
    }

    const petsFromBody = pets.length ? pets : dogs;
    const additionalsList = additionals
      .map((v) => ADDITIONAL_LABELS[v] || v)
      .filter(Boolean);

    const recurrenceLabel =
      recurrence === "weekly"
        ? "weekly"
        : recurrence === "monthly"
        ? "monthly"
        : recurrence === "six-months"
        ? "every 6 months"
        : recurrence === "yearly"
        ? "yearly"
        : "";

    const aggregatedNotes = [
      notes?.trim(),
      additionalsList.length ? `Extras: ${additionalsList.join(", ")}` : "",
      recurrenceLabel ? `Auto-renew: ${recurrenceLabel}` : "",
      preparedSchedule.length > 1 ? "Multi-visit booking" : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const bookingResults = [];
    const calendarResults = [];

    for (const entry of preparedSchedule) {
      const { start, end } = resolveBookingTimes({
        date: entry.date,
        time: entry.time,
        durationMinutes: entry.durationMinutes,
        timeZone,
      });

      const adjacent = await findAdjacentBookings({
        start: start.toUTC().toISO(),
        end: end.toUTC().toISO(),
      });

      const travel = await validateTravelWindow({
        start,
        end,
        clientAddress,
        previousBooking: adjacent.previous,
        nextBooking: adjacent.next,
        baseAddress:
          process.env.TRAVEL_HOME_ADDRESS ||
          process.env.HOME_BASE_ADDRESS ||
          DEFAULT_HOME_ADDRESS,
      });

      if (!travel.ok) {
        res.statusCode = 409;
        res.end(JSON.stringify({ message: travel.message }));
        return;
      }

      const bookingResult = await createBookingWithProfiles({
        date: entry.date,
        time: entry.time,
        durationMinutes: entry.durationMinutes,
        serviceId,
        serviceTitle,
        clientName,
        clientPhone,
        clientAddress,
        clientEmail,
        notes: aggregatedNotes,
        timeZone,
        pets: petsFromBody,
        dogCount,
        paymentOrderId,
      });
      console.log("BOOKING RESULT RAW:", bookingResult);

      const timing = buildFriendlyTiming({ start, end, timeZone });
      bookingResults.push({
        booking: bookingResult.booking,
        client: bookingResult.client,
        pets: bookingResult.pets,
        service: bookingResult.service,
        timing,
        startIso: start.toUTC().toISO(),
        endIso: end.toUTC().toISO(),
      });

      if (calendarId && accessToken && bookingResult?.booking?.id) {
        try {
          const calendarEvent = await createEvent({
            accessToken,
            calendarId,
            subject: `Pending payment · ${
              serviceTitle || bookingResult?.booking?.service_title || "Service"
            }`,
            start: start.toUTC().toISO(),
            end: end.toUTC().toISO(),
            timeZone,
            locationDisplayName: clientAddress,
            body: `Booking pending payment for ${
              serviceTitle || bookingResult?.booking?.service_title || "Service"
            }.`,
            bodyContentType: "HTML",
            categories: [PENDING_PAYMENT_CATEGORY],
            showAs: "tentative",
            attendeeEmail: clientEmail,
          });

          if (calendarEvent?.id) {
            await saveBookingCalendarEventId(
              bookingResult.booking.id,
              calendarEvent.id
            );
          }

          calendarResults.push({
            bookingId: bookingResult.booking.id,
            ok: Boolean(calendarEvent?.id),
          });
        } catch (calendarError) {
          console.error("Calendar creation failed", calendarError);
          calendarResults.push({
            bookingId: bookingResult.booking.id,
            ok: false,
            error: calendarError.message,
          });
        }
      }
    }

    // ---------------------------------------
    // SAFE BOOKING ID EXTRACTION
    // ---------------------------------------
    const primary = bookingResults?.[0] || {};

    // Try all possible locations of the ID
    const primaryBookingId =
      primary?.booking?.id || primary?.id || primary?.booking_id;

    if (!primaryBookingId) {
      console.error("❌ BACKEND: No booking ID found", { bookingResults });
      res.statusCode = 500;
      return res.end(
        JSON.stringify({
          message: "Booking created but no booking ID returned",
        })
      );
    }

    const scheduleSummary = bookingResults.map((e, i) => ({
      label: `Visit ${i + 1}`,
      start: e.timing.start,
      end: e.timing.end,
    }));

    const confirmationBody = buildConfirmationBody({
      clientName,
      timing: bookingResults[0]?.timing || buildFriendlyTiming({
        start: DateTime.now().toUTC(),
        end: DateTime.now().toUTC(),
        timeZone,
      }),
      service: bookingResults[0]?.service || { title: serviceTitle },
      notes: aggregatedNotes,
      pets: petsFromBody,
      clientAddress,
      schedule: scheduleSummary,
      recurrence: recurrenceLabel || (autoRenew ? "requested" : ""),
      additionals: additionalsList,
      amount: Number(amount) || null,
      paymentPreference,
    });

    const notificationBody = buildNotificationBody({
      service: { title: serviceTitle },
      client: { full_name: clientName, email: clientEmail },
      timing: bookingResults[0]?.timing || buildFriendlyTiming({
        start: DateTime.now().toUTC(),
        end: DateTime.now().toUTC(),
        timeZone,
      }),
      notes: aggregatedNotes,
      pets: petsFromBody,
      schedule: scheduleSummary,
      recurrence: recurrenceLabel || (autoRenew ? "requested" : ""),
      additionals: additionalsList,
      paymentPreference,
      paymentReference: paymentOrderId,
    });

    let emailStatus = { ok: false };
    const shouldSendClientEmail =
      paymentPreference !== "pay_now" && Boolean(clientEmail);
    if (calendarId && accessToken) {
      try {
        if (shouldSendClientEmail) {
          await sendMail({
            accessToken,
            fromCalendarId: calendarId,
            to: clientEmail,
            subject: buildConfirmationSubject({
              pets: petsFromBody,
              service: bookingResults[0]?.service || { title: serviceTitle },
            }),
            body: confirmationBody,
            contentType: "HTML",
          });
        }

        const notificationEmail = resolveNotificationEmail(calendarId);
        if (notificationEmail) {
          await sendMail({
            accessToken,
            fromCalendarId: calendarId,
            to: notificationEmail,
            subject: `New booking: ${serviceTitle || "Service"}`,
            body: notificationBody,
            contentType: "HTML",
          });
        }

        emailStatus = { ok: true, client: shouldSendClientEmail };
      } catch (emailError) {
        console.error("Email send failed", emailError);
        emailStatus = { ok: false, error: emailError.message };
      }
    } else {
      emailStatus = { ok: false, skipped: true };
    }

    // ---------------------------------------
    // CORRECT, MINIMAL RESPONSE TO FRONTEND
    // ---------------------------------------
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        booking_id: primaryBookingId,
        schedule: scheduleSummary,
        recurrence: recurrenceLabel || (autoRenew ? "requested" : null),
        bookingMode:
          bookingMode || (preparedSchedule.length > 1 ? "multi-day" : "single"),
        emailStatus,
        calendarStatus: calendarResults.length
          ? { ok: calendarResults.every((entry) => entry.ok), calendarResults }
          : { ok: false, skipped: true },
      })
    );
  } catch (err) {
    console.error("Booking error", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: err.message }));
  }
};
