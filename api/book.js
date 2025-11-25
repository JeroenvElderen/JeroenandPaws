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

const resolveCalendarEmail = (calendarId) =>
  process.env.NEXT_PUBLIC_OUTLOOK_CALENDAR_EMAIL?.trim() ||
  process.env.OUTLOOK_SENDER_EMAIL?.trim() ||
  calendarId;

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderPetList = (pets = [], { includePhotos = false } = {}) => {
  return (pets || []).map((pet, index) => {
    const name = escapeHtml(pet?.name || `Pet ${index + 1}`);
    const breed = escapeHtml(pet?.breed || "Breed pending");
    const photoSrc = includePhotos
      ? escapeHtml(
          pet?.photo_url ||
            pet?.photoDataUrl ||
            pet?.photo_data_url ||
            ""
        )
      : "";

    const photoBlock = photoSrc
      ? `<div style="margin: 6px 0 0;"><img src="${photoSrc}" alt="${name} photo" style="width: 140px; max-width: 100%; border-radius: 12px; object-fit: cover;" /></div>`
      : "";

    return `<li><strong>${name}</strong> (${breed})${photoBlock}</li>`;
  });
};

const renderScheduleBlock = (schedule = []) => {
  if (!Array.isArray(schedule) || schedule.length === 0) return "";

  const items = schedule.map((item, index) => {
    const label = escapeHtml(item?.label || `Visit ${index + 1}`);
    const start = escapeHtml(item?.start || "");
    const end = escapeHtml(item?.end || "");
    return `<li><strong>${label}</strong>${start ? ` — ${start}` : ""}${
      end ? ` (ends ${end})` : ""
    }</li>`;
  });

  return `<p style="margin: 12px 0 8px;"><strong>Schedule:</strong></p><ul style="margin: 0; padding-left: 20px;">${items.join(
    ""
  )}</ul>`;
};

const formatRecurrenceMessage = (recurrence) => {
  switch (recurrence) {
    case" weekly":
      return "Auto-renews every week.";
    case "monthly":
      return "Auto-renews every month.";
    case "every 6 months":
      return "Auto-renews every 6 months.";
    case "yearly":
      return "Auto-renews every year.";
    case "requested":
      return "Auto-renewal requested.";
    default:
      return "";
  }
};

const WINDOWS_TO_IANA = {
  "GMT Standard Time": "Europe/London",
};

const resolveTimeZone = (timeZone = "UTC") => {
  const candidate = WINDOWS_TO_IANA[timeZone] || timeZone || "UTC";
  return DateTime.now().setZone(candidate).isValid ? candidate : "UTC";
};

const buildFriendlyTiming = ({ start, end, timeZone = "UTC" }) => {
  const format = "cccc, LLLL d, yyyy 'at' t ZZZZ";
  const zone = resolveTimeZone(timeZone);
  const ensureDateTime = (value) => {
    if (DateTime.isDateTime(value)) return value;
    return DateTime.fromISO(String(value), { zone: "UTC" });
  };

  const formatDate = (value) => {
    const parsed = ensureDateTime(value);
    if (!parsed.isValid) return "Date pending";

    const zoned = parsed.setZone(zone, { keepLocalTime: false });
    return zoned.isValid
      ? zoned.toFormat(format)
      : parsed.toUTC().toFormat(format);
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
    timeZone: zone,
  };
};

const buildConfirmationBody = ({
  clientName,
  timing,
  service,
  notes,
  pets,
  passwordDelivery,
  clientAddress,
  schedule = [],
  recurrence = "",
}) => {
  const readableService = service?.title || service?.serviceTitle || "Training";
  const petDetails = renderPetList(pets);

  const passwordBlock = passwordDelivery
    ? `<p style="margin: 16px 0 0;">An account has been created for you so you can update bookings and pets later. Use this temporary password to sign in: <strong>${escapeHtml(
        passwordDelivery.temporaryPassword
      )}</strong>.</p>`
    : "";

  const notesBlock = notes
    ? `<p style="margin: 16px 0 0;"><strong>Notes from you:</strong><br>${escapeHtml(
        notes
      )}</p>`
    : "";

  const petsBlock =
    petDetails.length > 0
      ? `<ol style="margin: 0; padding-left: 20px;">${petDetails.join("")}</ol>`
      : '<p style="margin: 8px 0 0;">No pets were attached yet.</p>';

  const addressBlock = clientAddress
    ? `<p style="margin: 12px 0 0;"><strong>Address:</strong><br>${escapeHtml(
        clientAddress
      )}</p>`
    : "";
  const scheduleBlock = renderScheduleBlock(schedule);
  const recurrenceBlock = formatRecurrenceMessage(recurrence)
    ? `<p style="margin: 12px 0 0;">${formatRecurrenceMessage(recurrence)}</p>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <p style="margin: 0 0 12px;">Hi ${escapeHtml(clientName || "there")},</p>
      <p style="margin: 0 0 12px;">
        Thank you for booking <strong>${escapeHtml(
          readableService
        )}</strong>. Here are your appointment details:
      </p>
      <ul style="padding-left: 20px; margin: 0 0 12px;">
        <li><strong>Starts:</strong> ${escapeHtml(timing.start)}</li>
        <li><strong>Ends:</strong> ${escapeHtml(timing.end)}</li>
        <li><strong>Time zone:</strong> ${escapeHtml(
          timing.timeZone || "UTC"
        )}</li>
      </ul>
      <p style="margin: 12px 0 8px;"><strong>Pets:</strong></p>
      ${petsBlock}
      ${addressBlock}
      ${scheduleBlock}
      ${recurrenceBlock}
      ${notesBlock}
       ${passwordBlock}
      <p style="margin: 16px 0 0;">If you need to reschedule or have questions, just reply to this email and we'll be happy to help.</p>
      <p style="margin: 8px 0 0;">Looking forward to seeing you soon!</p>
    </div>
  `;
};

const buildNotificationBody = ({
  service,
  client,
  timing,
  notes,
  pets,
  schedule = [],
  recurrence = "",
}) => {
  const readableService = service?.title || service?.serviceTitle || "Training";
  const petDetails = renderPetList(pets, { includePhotos: true });

  const notesBlock = notes
    ? `<p style="margin: 16px 0 0;"><strong>Client notes:</strong><br>${escapeHtml(
        notes
      )}</p>`
    : "";

  const addressBlock = client?.address
    ? `<p style="margin: 12px 0 0;"><strong>Address:</strong><br>${escapeHtml(
        client.address
      )}</p>`
    : "";

  const scheduleBlock = renderScheduleBlock(schedule);
  const recurrenceBlock = formatRecurrenceMessage(recurrence)
    ? `<p style="margin: 12px 0 0;">${formatRecurrenceMessage(recurrence)}</p>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <p style="margin: 0 0 12px;">New booking received:</p>
      <ul style="padding-left: 20px; margin: 0 0 12px;">
        <li><strong>Client:</strong> ${escapeHtml(
          client?.full_name || client?.email
        )}</li>
        <li><strong>Email:</strong> ${escapeHtml(client?.email)}</li>
        <li><strong>Service:</strong> ${escapeHtml(readableService)}</li>
        <li><strong>Starts:</strong> ${escapeHtml(timing.start)}</li>
        <li><strong>Ends:</strong> ${escapeHtml(timing.end)}</li>
        <li><strong>Time zone:</strong> ${escapeHtml(
          timing.timeZone || "UTC"
        )}</li>
      </ul>
      <p style="margin: 12px 0 8px;"><strong>Pets:</strong></p>
      <ol style="margin: 0; padding-left: 20px;">${petDetails.join("")}</ol>
      ${notesBlock}
      ${addressBlock}
      ${scheduleBlock}
      ${recurrenceBlock}
      <p style="margin: 16px 0 0;">This is an internal notification for Jeroen & Paws.</p>
    </div>
  `;
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
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
      } catch (authError) {
        console.error("Booking email auth error", authError);
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
    } = body;

    const trimmedName = (clientName || "").trim();
    const trimmedPhone = (clientPhone || "").trim();
    const trimmedAddress = (clientAddress || "").trim();
    const trimmedEmail = (clientEmail || "").trim();
    const trimmedNotes = (notes || "").trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail || !trimmedAddress) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message:
            "Name, phone, email, and address are required to complete a booking",
        })
      );
      return;
    }

    const preparedSchedule = (Array.isArray(schedule) ? schedule : [])
      .map((entry) => ({
        date: entry?.date,
        time: entry?.time,
        durationMinutes: Number.isFinite(entry?.durationMinutes)
          ? entry.durationMinutes
          : durationMinutes,
      }))
      .filter((entry) => entry.date && entry.time);

    if (!preparedSchedule.length && date && time) {
      preparedSchedule.push({
        date,
        time,
        durationMinutes,
      });
    }

    if (!preparedSchedule.length) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Missing schedule details" }));
      return;
    }

    const petsFromBody =
      Array.isArray(pets) && pets.length ? pets : dogs || [];

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

    const recurrenceNote = recurrenceLabel
      ? `Auto-renew requested: ${recurrenceLabel}.`
      : autoRenew
      ? "Auto-renew requested."
      : "";

    const aggregatedNotes = [
      trimmedNotes,
      recurrenceNote,
      bookingMode === "multi-day" || preparedSchedule.length > 1
        ? `Multi-visit booking with ${preparedSchedule.length} dates.`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const validatedSchedule = [];

    for (const entry of preparedSchedule) {
      const entryDuration = Number.isFinite(entry.durationMinutes)
        ? entry.durationMinutes
        : durationMinutes;

      const { start, end } = resolveBookingTimes({
        date: entry.date,
        time: entry.time,
        durationMinutes: entryDuration,
        timeZone,
      });

      const adjacentBookings = await findAdjacentBookings({
        start: start.toUTC().toISO(),
        end: end.toUTC().toISO(),
      });

      const travelCheck = await validateTravelWindow({
        start,
        end,
        clientAddress: trimmedAddress,
        previousBooking: adjacentBookings.previous,
        nextBooking: adjacentBookings.next,
        baseAddress:
          process.env.TRAVEL_HOME_ADDRESS ||
          process.env.HOME_BASE_ADDRESS ||
          DEFAULT_HOME_ADDRESS,
      });

      if (!travelCheck.ok) {
        res.statusCode = 409;
        res.end(
          JSON.stringify({
            message:
              travelCheck.message ||
              "Please choose a different time so we have enough travel time between bookings.",
          })
        );
        return;
      }

    validatedSchedule.push({
        ...entry,
        durationMinutes: entryDuration,
        start,
        end,
      });
    }

    const bookingResults = [];

    for (const entry of validatedSchedule) {
      const bookingResult = await createBookingWithProfiles({
        date: entry.date,
        time: entry.time,
        durationMinutes: entry.durationMinutes,
        serviceId,
        serviceTitle,
        clientName: trimmedName,
        clientPhone: trimmedPhone,
        clientAddress: trimmedAddress,
        clientEmail: trimmedEmail,
        notes: aggregatedNotes,
        timeZone,
        pets: petsFromBody,
        dogCount,
      });

      console.log("➡️ BOOKING RESULT:", bookingResult);
      console.log("➡️ start_at:", bookingResult?.booking?.start_at);
      console.log("➡️ end_at:", bookingResult?.booking?.end_at);

      console.log(
        "➡️ Parsed start:",
        DateTime.fromISO(bookingResult?.booking?.start_at, { zone: "UTC" })
          .isValid,
        DateTime.fromISO(bookingResult?.booking?.start_at, {
          zone: "UTC",
        }).toISO()
      );

      console.log(
        "➡️ Parsed end:",
        DateTime.fromISO(bookingResult?.booking?.end_at, { zone: "UTC" }).isValid,
        DateTime.fromISO(bookingResult?.booking?.end_at, { zone: "UTC" }).toISO()
      );

      const timing = buildFriendlyTiming({
        start: entry.start,
        end: entry.end,
        timeZone,
      });

      bookingResults.push({ bookingResult, timing, entry });
    }

    const notificationRecipients = Array.from(
      new Set(
        [
          calendarEmail,
          process.env.BOOKING_NOTIFICATION_EMAIL,
          process.env.NOTIFY_EMAIL,
          process.env.JEROEN_AND_PAWS_EMAIL,
          "jeroen@jeroenandpaws.com",
        ].filter(Boolean)
      )
    );

    const calendarStatuses = [];

    if (accessToken && calendarId) {
      for (const entry of bookingResults) {
        const calendarStatus = {
          bookingId: entry.bookingResult.booking.id,
          created: false,
          skipped: false,
          error: null,
        };

        try {
          const eventStart = DateTime.fromISO(entry.bookingResult.booking.start_at)
            .toUTC()
            .toISO({ suppressMilliseconds: true });
          const eventEnd = DateTime.fromISO(entry.bookingResult.booking.end_at)
            .toUTC()
            .toISO({ suppressMilliseconds: true });

          const eventResponse = await createEvent({
            accessToken,
            calendarId,
            subject: entry.bookingResult.service?.title || serviceTitle,
            body: buildNotificationBody({
              service: entry.bookingResult.service || { serviceTitle },
              client: entry.bookingResult.client,
              timing: entry.timing,
              notes: aggregatedNotes,
              pets: entry.bookingResult.pets,
              schedule: bookingResults.map((booking, index) => ({
                label: `Visit ${index + 1}`,
                start: booking.timing.start,
                end: booking.timing.end,
              })),
              recurrence: recurrenceLabel || (autoRenew ? "requested" : null),
            }),
            bodyContentType: "HTML",
            start: eventStart, // ✅ already ISO string
            end: eventEnd, // ✅ already ISO string
            attendeeEmail: clientEmail,
            timeZone: timeZone || "UTC",
          });

        calendarStatus.created = true;

          if (eventResponse?.id) {
            try {
              await saveBookingCalendarEventId(
                entry.bookingResult.booking.id,
                eventResponse.id
              );
            } catch (storeEventError) {
              console.error(
                "Failed to persist calendar event id for booking",
                storeEventError
              );
            }
          }
          } catch (eventError) {
          console.error("Booking calendar event failed", eventError);
          calendarStatus.error =
            eventError?.message || "Calendar event creation failed";
        }

          calendarStatuses.push(calendarStatus);
      }
    } else {
      bookingResults.forEach((entry) => {
        calendarStatuses.push({
          bookingId: entry.bookingResult.booking.id,
          created: false,
          skipped: true,
          error: null,
        });
      });
    }

    const emailStatus = {
      confirmationSent: false,
      notificationCount: 0,
      skipped: false,
      error: null,
    };

    const scheduleSummary = bookingResults.map((booking, index) => ({
      label: `Visit ${index + 1}`,
      start: booking.timing.start,
      end: booking.timing.end,
    }));

    const passwordDelivery =
      bookingResults.find((entry) => entry.bookingResult.passwordDelivery)?.
        bookingResult.passwordDelivery || null;

    if (accessToken && calendarId && clientEmail) {
      try {
        const confirmationBody = buildConfirmationBody({
          clientName,
          timing: bookingResults[0]?.timing,
          service: bookingResults[0]?.bookingResult.service || { serviceTitle },
          notes: aggregatedNotes,
          pets: bookingResults[0]?.bookingResult.pets,
          passwordDelivery,
          clientAddress,
          schedule: scheduleSummary,
          recurrence: recurrenceLabel || (autoRenew ? "requested" : null),
        });

        await sendMail({
          accessToken,
          fromCalendarId: calendarId,
          to: clientEmail,
          subject:
            bookingResults[0]?.bookingResult.service?.title || serviceTitle,
          body: confirmationBody,
          contentType: "HTML",
        });
        emailStatus.confirmationSent = true;

        if (notificationRecipients.length) {
          const notificationBody = buildNotificationBody({
            service: bookingResults[0]?.bookingResult.service || { serviceTitle },
            client: bookingResults[0]?.bookingResult.client,
            timing: bookingResults[0]?.timing,
            notes: aggregatedNotes,
            pets: bookingResults[0]?.bookingResult.pets,
            schedule: scheduleSummary,
            recurrence: recurrenceLabel || (autoRenew ? "requested" : null),
          });

          await sendMail({
            accessToken,
            fromCalendarId: calendarId,
            to: notificationRecipients,
            subject: `New booking: ${
              bookingResults[0]?.bookingResult.service?.title || serviceTitle
            }`,
            body: notificationBody,
            contentType: "HTML",
          });
        }
        emailStatus.notificationCount = notificationRecipients.length;
      } catch (emailError) {
        console.error("Booking email delivery failed", emailError);
        emailStatus.error = emailError?.message || "Email delivery failed";
      }
    } else {
      emailStatus.skipped = true;
    }
    const calendarStatus = {
      created: calendarStatuses.every((status) => status.created),
      skipped: calendarStatuses.every((status) => status.skipped),
      error: calendarStatuses.find((status) => status.error)?.error || null,
      entries: calendarStatuses,
    };

    const primaryResult = bookingResults[0];

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        bookings: bookingResults.map((entry) => entry.bookingResult.booking),
        client: primaryResult?.bookingResult.client,
        pets: primaryResult?.bookingResult.pets,
        passwordDelivery,
        service: primaryResult?.bookingResult.service || { title: serviceTitle },
        totals: primaryResult?.bookingResult.totals,
        calendarStatus,
        emailStatus,
        schedule: scheduleSummary,
        recurrence: recurrenceLabel || (autoRenew ? "requested" : null),
        bookingMode: bookingMode || (preparedSchedule.length > 1 ? "multi-day" : "single"),
      })
    );
  } catch (error) {
    console.error("Booking error", error);
    const status = error.statusCode || error.status || 500;
    const message =
      error.publicMessage ||
      error.message ||
      "Failed to book event. Please try again later.";

    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message }));
  }
};
