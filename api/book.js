const { DateTime } = require("luxon");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { createEvent, listCalendarEvents, sendMail } = require("./_lib/graph");
const {
  createBookingWithProfiles,
  findAdjacentBookings,
  resolveBookingTimes,
} = require("./_lib/supabase");
const { DEFAULT_HOME_ADDRESS, validateTravelWindow } = require("./_lib/travel");

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

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
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

const extractEircode = (value = "") => {
  const match = String(value).toUpperCase().match(/([A-Z0-9]{3}[A-Z0-9]{4})/);
  return match ? match[1] : "";
};

const deriveEventAddress = (event = {}) => {
  const location = event?.location || {};
  const display =
    location.displayName ||
    location?.address?.text ||
    location?.address?.street ||
    "";

  const resolvedEircode = extractEircode(display);
  return (resolvedEircode || display || "").trim();
};

const normalizeStop = (stop = {}) => {
  const startAt = stop.start_at || stop.start || stop.startAt;
  const endAt = stop.end_at || stop.end || stop.endAt;
  if (!startAt || !endAt) return null;

  const clientAddress =
    stop.client_address || stop.address || deriveEventAddress(stop) || "";

  return {
    start_at: startAt,
    end_at: endAt,
    client_address: clientAddress,
  };
};

const findAdjacentCalendarStops = async ({
  accessToken,
  calendarId,
  start,
  end,
}) => {
  if (!accessToken || !calendarId) return { previous: null, next: null };

  try {
    const windowStart = start.minus({ days: 1 }).toUTC().toISO();
    const windowEnd = end.plus({ days: 1 }).toUTC().toISO();

    const events = await listCalendarEvents({
      accessToken,
      calendarId,
      startDateTime: windowStart,
      endDateTime: windowEnd,
    });

    const bookingStart = start.toUTC();
    const bookingEnd = end.toUTC();

    const candidates = events
      .map((event) => {
        const eventStart = DateTime.fromISO(event?.start?.dateTime, {
          zone: event?.start?.timeZone || "UTC",
        }).toUTC();
        const eventEnd = DateTime.fromISO(event?.end?.dateTime, {
          zone: event?.end?.timeZone || "UTC",
        }).toUTC();

        if (!eventStart.isValid || !eventEnd.isValid) return null;

        return {
          start_at: eventStart.toISO(),
          end_at: eventEnd.toISO(),
          client_address: deriveEventAddress(event),
        };
      })
      .filter(Boolean)
      .sort((a, b) => DateTime.fromISO(a.start_at) - DateTime.fromISO(b.start_at));

    let previous = null;
    let next = null;

    for (const candidate of candidates) {
      const candidateEnd = DateTime.fromISO(candidate.end_at);
      const candidateStart = DateTime.fromISO(candidate.start_at);

      if (candidateEnd <= bookingStart) {
        if (!previous || candidateEnd > DateTime.fromISO(previous.end_at)) {
          previous = candidate;
        }
        continue;
      }

      if (candidateStart >= bookingEnd) {
        if (!next || candidateStart < DateTime.fromISO(next.start_at)) {
          next = candidate;
        }
        break;
      }
    }

    return { previous, next };
  } catch (error) {
    console.error("Calendar adjacency lookup failed", error);
    return { previous: null, next: null };
  }
};

const chooseAdjacentStops = ({
  bookingStart,
  bookingEnd,
  supabaseAdjacent,
  calendarAdjacent,
}) => {
  const startUtc = bookingStart.toUTC();
  const endUtc = bookingEnd.toUTC();

  const previousCandidates = [
    normalizeStop(supabaseAdjacent?.previous),
    normalizeStop(calendarAdjacent?.previous),
  ].filter(Boolean);

  const nextCandidates = [
    normalizeStop(supabaseAdjacent?.next),
    normalizeStop(calendarAdjacent?.next),
  ].filter(Boolean);

  let previous = null;
  for (const candidate of previousCandidates) {
    const candidateEnd = DateTime.fromISO(candidate.end_at, { zone: "UTC" });
    if (!candidateEnd.isValid || candidateEnd > startUtc) continue;
    if (!previous || candidateEnd > DateTime.fromISO(previous.end_at, { zone: "UTC" })) {
      previous = candidate;
    }
  }

  let next = null;
  for (const candidate of nextCandidates) {
    const candidateStart = DateTime.fromISO(candidate.start_at, { zone: "UTC" });
    if (!candidateStart.isValid || candidateStart < endUtc) continue;
    if (!next || candidateStart < DateTime.fromISO(next.start_at, { zone: "UTC" })) {
      next = candidate;
    }
  }

  return { previous, next };
};

const renderPetList = (pets = [], { includePhotos = false } = {}) =>
  (pets || []).map((pet, i) => {
    const name = escapeHtml(pet?.name || `Pet ${i + 1}`);
    const breed = escapeHtml(pet?.breed || "Breed pending");
    const photo = includePhotos
      ? escapeHtml(
          pet?.photo_url || pet?.photoDataUrl || pet?.photo_data_url || ""
        )
      : "";

    return `<li><strong>${name}</strong> (${breed})${
      photo
        ? `<div style="margin:6px 0 0;"><img src="${photo}" alt="${name} photo"
           style="width:140px;max-width:100%;border-radius:12px;object-fit:cover"/></div>`
        : ""
    }</li>`;
  });

const renderScheduleBlock = (schedule = []) =>
  !Array.isArray(schedule) || !schedule.length
    ? ""
    : `<p style="margin:12px 0 8px;"><strong>Schedule:</strong></p><ul style="margin:0;padding-left:20px;">${schedule
        .map((item, i) => {
          const label = escapeHtml(item?.label || `Visit ${i + 1}`);
          const start = escapeHtml(item?.start || "");
          const end = escapeHtml(item?.end || "");
          return `<li><strong>${label}</strong>${start ? ` — ${start}` : ""}${
            end ? ` (ends ${end})` : ""
          }</li>`;
        })
        .join("")}</ul>`;

const formatRecurrenceMessage = (r) =>
  ({
    weekly: "Auto-renews every week.",
    monthly: "Auto-renews every month.",
    "every 6 months": "Auto-renews every 6 months.",
    yearly: "Auto-renews every year.",
    requested: "Auto-renewal requested.",
  }[r] || "");

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
  additionals = [],
}) => {
  const readable = service?.title || "Training";
  const petsList = renderPetList(pets).join("");
  const addBlock =
    additionals.length > 0
      ? `<p style="margin:12px 0 0;"><strong>Extras:</strong></p><ul style="margin:0;padding-left:20px;">${additionals
          .map((i) => `<li>${escapeHtml(i)}</li>`)
          .join("")}</ul>`
      : "";
  const notesBlock = notes
    ? `<p style="margin:16px 0 0;"><strong>Notes from you:</strong><br>${escapeHtml(
        notes
      )}</p>`
    : "";
  const pwdBlock = passwordDelivery
    ? `<p style="margin:16px 0 0;">Your temporary password: <strong>${escapeHtml(
        passwordDelivery.temporaryPassword
      )}</strong></p>`
    : "";
  const addr = clientAddress
    ? `<p style="margin:12px 0 0;"><strong>Address:</strong><br>${escapeHtml(
        clientAddress
      )}</p>`
    : "";

  return `
  <div>
    <p>Hi ${escapeHtml(clientName)},</p>
    <p>Thank you for booking <strong>${escapeHtml(readable)}</strong>.</p>
    <ul>
      <li><strong>Starts:</strong> ${escapeHtml(timing.start)}</li>
      <li><strong>Ends:</strong> ${escapeHtml(timing.end)}</li>
      <li><strong>Time zone:</strong> ${escapeHtml(timing.timeZone)}</li>
    </ul>
    <p><strong>Pets:</strong></p>
    <ol>${petsList}</ol>
    ${addr}
    ${renderScheduleBlock(schedule)}
    ${
      formatRecurrenceMessage(recurrence)
        ? `<p>${formatRecurrenceMessage(recurrence)}</p>`
        : ""
    }
    ${addBlock}
    ${notesBlock}
    ${pwdBlock}
    <p>See you soon!</p>
  </div>`;
};

const buildNotificationBody = ({
  service,
  client,
  timing,
  notes,
  pets,
  schedule,
  recurrence,
  additionals,
}) => {
  const readable = service?.title || "Training";
  return `
  <div>
    <p>New booking received:</p>
    <ul>
      <li><strong>Client:</strong> ${escapeHtml(
        client?.full_name || client?.email
      )}</li>
      <li><strong>Email:</strong> ${escapeHtml(client?.email)}</li>
      <li><strong>Service:</strong> ${escapeHtml(readable)}</li>
      <li><strong>Starts:</strong> ${escapeHtml(timing.start)}</li>
      <li><strong>Ends:</strong> ${escapeHtml(timing.end)}</li>
      <li><strong>Time zone:</strong> ${escapeHtml(timing.timeZone)}</li>
    </ul>
    <p><strong>Pets:</strong></p>
    <ol>${renderPetList(pets, { includePhotos: true }).join("")}</ol>
    ${
      notes
        ? `<p><strong>Client notes:</strong><br>${escapeHtml(notes)}</p>`
        : ""
    }
    ${schedule ? renderScheduleBlock(schedule) : ""}
    ${
      formatRecurrenceMessage(recurrence)
        ? `<p>${formatRecurrenceMessage(recurrence)}</p>`
        : ""
    }
    ${
      additionals.length
        ? `<p><strong>Extras:</strong> ${additionals.join(", ")}</p>`
        : ""
    }
  </div>`;
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
      clientEircode,
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
    } = body;

    const normalizedClientEircode = (clientEircode || "").trim();

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
    const calendarEvents = [];
    const baseAddress =
      process.env.TRAVEL_HOME_ADDRESS ||
      process.env.HOME_BASE_ADDRESS ||
      DEFAULT_HOME_ADDRESS;

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

      const calendarAdjacent = await findAdjacentCalendarStops({
        accessToken,
        calendarId,
        start,
        end,
      });

      const adjacency = chooseAdjacentStops({
        bookingStart: start,
        bookingEnd: end,
        supabaseAdjacent: adjacent,
        calendarAdjacent,
      });

      const travel = await validateTravelWindow({
        start,
        end,
        clientAddress: normalizedClientEircode || clientAddress,
        previousBooking: adjacency.previous,
        nextBooking: adjacency.next,
        baseAddress,
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
        clientAddress: normalizedClientEircode || clientAddress,
        clientEmail,
        notes: aggregatedNotes,
        timeZone,
        pets: petsFromBody,
        dogCount,
        amount: Number(amount) || null,
        payment_order_id: body.payment_order_id,
      });
      console.log("BOOKING RESULT RAW:", bookingResult);

      const timing = buildFriendlyTiming({ start, end, timeZone });

      if (accessToken && calendarId) {
        try {
          const event = await createEvent({
            accessToken,
            calendarId,
            subject: `${serviceTitle || "Booking"} — ${clientName}`,
            body: buildNotificationBody({
              service: { title: serviceTitle },
              client: { full_name: clientName, email: clientEmail },
              timing,
              notes: aggregatedNotes,
              pets: petsFromBody,
              schedule: preparedSchedule,
              recurrence: recurrenceLabel,
              additionals: additionalsList,
            }),
            bodyContentType: "HTML",
            start: start.toISO(),
            end: end.toISO(),
            timeZone,
            attendeeEmail: clientEmail,
            locationDisplayName:
              normalizedClientEircode || clientAddress || undefined,
          });

          calendarEvents.push({
            id: event?.id || null,
            start: event?.start?.dateTime || null,
            end: event?.end?.dateTime || null,
          });
        } catch (eventError) {
          console.error("Calendar event creation failed", eventError);
        }
      }

      bookingResults.push({
        booking: bookingResult.booking,
        client: bookingResult.client,
        pets: bookingResult.pets,
        timing,
      });
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

    // ---------------------------------------
    // CORRECT, MINIMAL RESPONSE TO FRONTEND
    // ---------------------------------------
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        booking_id: primaryBookingId,
        schedule: bookingResults.map((e, i) => ({
          label: `Visit ${i + 1}`,
          start: e.timing.start,
          end: e.timing.end,
        })),
        recurrence: recurrenceLabel || (autoRenew ? "requested" : null),
        bookingMode:
          bookingMode || (preparedSchedule.length > 1 ? "multi-day" : "single"),
        emailStatus: { skipped: true },
        calendarStatus: calendarEvents.length
          ? { created: calendarEvents.length, events: calendarEvents }
          : { skipped: true },
      })
    );
  } catch (err) {
    console.error("Booking error", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: err.message }));
  }
};
