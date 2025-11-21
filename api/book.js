const { DateTime } = require("luxon");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { createEvent, sendMail } = require("./_lib/graph");

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

const addMinutesToDateTime = (date, time, minutes) => {
  const start = new Date(`${date}T${time}:00Z`);
  start.setUTCMinutes(start.getUTCMinutes() + minutes);
  return start.toISOString().slice(0, 19);
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildFriendlyTiming = ({ date, time, durationMinutes, timeZone = "UTC" }) => {
  const zone = timeZone || "UTC";
  const start = DateTime.fromISO(`${date}T${time}`, { zone });
  const safeStart = start.isValid
    ? start
    : DateTime.fromISO(`${date}T${time}`, { zone: "UTC" });

  const end = safeStart.plus({ minutes: durationMinutes });
  const format = "cccc, LLLL d, yyyy 'at' t ZZZZ";

  return {
    start: safeStart.toFormat(format),
    end: end.toFormat(format),
  };
};

const buildConfirmationBody = ({
  clientName,
  serviceId,
  serviceTitle,
  timing,
  notes,
  dogs,
  dogCount,
  timeZone,
}) => {
  const readableService = serviceTitle || `Training booking (${serviceId || "custom"})`;
  const dogEntries = Array.isArray(dogs) ? dogs : [];
  const hasDogs = dogEntries.length > 0;

  const dogDetails = hasDogs
    ? `<ol style="margin: 0; padding-left: 20px;">
        ${dogEntries
          .map((dog, index) => {
            const name = escapeHtml(dog?.name || "Name pending");
            const breed = escapeHtml(dog?.breed || "Breed pending");
            const photoName = escapeHtml(dog?.photoName || "Uploaded photo");
            const hasPhoto = Boolean(dog?.photoDataUrl);

            return `<li><strong>Dog ${index + 1}:</strong> ${name} (${breed})${
              hasPhoto ? ` — Photo: ${photoName}` : ""
            }</li>`;
          })
          .join("")}
      </ol>`
    : `<p style="margin: 8px 0 0;"><strong>Dogs:</strong> ${
        dogCount ?? dogEntries.length ?? 0
      } (details pending)</p>`;

  const notesBlock = notes
    ? `<p style="margin: 16px 0 0;"><strong>Notes from you:</strong><br>${escapeHtml(
        notes
      )}</p>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <p style="margin: 0 0 12px;">Hi ${escapeHtml(clientName || "there")},</p>
      <p style="margin: 0 0 12px;">
        Thank you for booking <strong>${escapeHtml(readableService)}</strong>. Here are your appointment details:
      </p>
      <ul style="padding-left: 20px; margin: 0 0 12px;">
        <li><strong>Starts:</strong> ${escapeHtml(timing.start)}</li>
        <li><strong>Ends:</strong> ${escapeHtml(timing.end)}</li>
        <li><strong>Time zone:</strong> ${escapeHtml(timeZone || "UTC")}</li>
      </ul>
      ${dogDetails}
      ${notesBlock}
      <p style="margin: 16px 0 0;">
        If you need to reschedule or have questions, just reply to this email and we'll be happy to help.
      </p>
      <p style="margin: 8px 0 0;">Looking forward to seeing you soon!</p>
    </div>
  `;
};

const buildNotificationBody = ({
  serviceTitle,
  serviceId,
  clientName,
  clientEmail,
  timing,
  timeZone,
  notes,
  dogs,
  dogCount,
}) => {
  const readableService = serviceTitle || `Training booking (${serviceId || "custom"})`;
  const dogEntries = Array.isArray(dogs) ? dogs : [];
  const hasDogs = dogEntries.length > 0;

  const dogDetails = hasDogs
    ? `<ol style="margin: 0; padding-left: 20px;">
        ${dogEntries
          .map((dog, index) => {
            const name = escapeHtml(dog?.name || "Name pending");
            const breed = escapeHtml(dog?.breed || "Breed pending");
            const hasPhoto = Boolean(dog?.photoDataUrl);

            return `<li><strong>Dog ${index + 1}:</strong> ${name} (${breed})${
              hasPhoto ? " — photo uploaded" : ""
            }</li>`;
          })
          .join("")}
      </ol>`
    : `<p style="margin: 8px 0 0;"><strong>Dogs:</strong> ${
        dogCount ?? dogEntries.length ?? 0
      } (details pending)</p>`;

  const notesBlock = notes
    ? `<p style="margin: 16px 0 0;"><strong>Client notes:</strong><br>${escapeHtml(
        notes
      )}</p>`
    : "";

  const clientLine =
    clientName || clientEmail
      ? `${escapeHtml(clientName || "Client")} (${escapeHtml(clientEmail || "email missing")})`
      : "Unknown client";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <p style="margin: 0 0 12px;">New booking received:</p>
      <ul style="padding-left: 20px; margin: 0 0 12px;">
        <li><strong>Client:</strong> ${clientLine}</li>
        <li><strong>Service:</strong> ${escapeHtml(readableService)}</li>
        <li><strong>Starts:</strong> ${escapeHtml(timing.start)}</li>
        <li><strong>Ends:</strong> ${escapeHtml(timing.end)}</li>
        <li><strong>Time zone:</strong> ${escapeHtml(timeZone || "UTC")}</li>
      </ul>
      ${dogDetails}
      ${notesBlock}
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
    if (!calendarId) {
      throw new Error("Missing OUTLOOK_CALENDAR_ID env var");
    }

    const accessToken = await getAppOnlyAccessToken();
    const body = await parseBody(req);
    const {
      date,
      time,
      durationMinutes = 60,
      serviceId,
      serviceTitle,
      clientName,
      clientEmail,
      notes,
      timeZone = "UTC",
      dogs = [],
      dogCount,
    } = body;

    const teamEmail =
      process.env.BOOKING_NOTIFICATION_EMAIL ||
      process.env.NOTIFY_EMAIL ||
      process.env.JEROEN_AND_PAWS_EMAIL;

    const bookingFromEmail = 
      process.env.BOOKING_SENDER_EMAIL || "booking@jeroenandpaws.com";
    const ownerNotificationEmail = "jeroen@jeroenandpaws.com";

    if (!date || !time) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Missing date or time" }));
      return;
    }

    const startDateTime = `${date}T${time}:00`;
    const endDateTime = addMinutesToDateTime(date, time, durationMinutes);

    const subject = serviceTitle || `Training booking (${serviceId || "custom"})`;
    const timing = buildFriendlyTiming({
      date,
      time,
      durationMinutes,
      timeZone,
    });
    const confirmationBody = buildConfirmationBody({
      clientName,
      serviceId,
      serviceTitle,
      timing,
      notes,
      dogs,
      dogCount,
      timeZone,
    });

    const event = await createEvent({
      accessToken,
      calendarId,
      subject,
      body: confirmationBody,
      bodyContentType: "HTML",
      start: startDateTime,
      end: endDateTime,
      attendeeEmail: clientEmail,
      attendeeEmails: [],
      timeZone,
    });

    const notificationBody = buildNotificationBody({
      serviceTitle,
      serviceId,
      clientName,
      clientEmail,
      timing,
      timeZone,
      notes,
      dogs,
      dogCount,
    });

    const notificationRecipients = [teamEmail, ownerNotificationEmail].filter(
      Boolean
    );

    if (notificationRecipients.length) {
      await sendMail({
        accessToken,
        fromCalendarId: calendarId,
        to: notificationRecipients,
        subject: `New booking: ${subject}`,
        body: notificationBody,
        contentType: "HTML",
        from: bookingFromEmail,
        replyTo: bookingFromEmail,
      });
    }
    
    await sendMail({
      accessToken,
      fromCalendarId: calendarId,
      to: clientEmail,
      subject,
      body: confirmationBody,
      contentType: "HTML",
      from: bookingFromEmail,
      replyTo: bookingFromEmail,
    });
    
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        id: event.id,
        webLink: event.webLink,
        subject,
        start: event.start,
        end: event.end,
      })
    );
  } catch (error) {
    console.error("Booking error", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: "Failed to book event" }));
  }
};