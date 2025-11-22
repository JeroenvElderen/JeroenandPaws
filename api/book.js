const { DateTime } = require("luxon");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { sendMail } = require("./_lib/graph");
const { createBookingWithProfiles } = require("./_lib/supabase");

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

const buildFriendlyTiming = ({ start, end, timeZone = "UTC" }) => {
  const format = "cccc, LLLL d, yyyy 'at' t ZZZZ";
  const zone = timeZone || "UTC";
  const safeStart = start.setZone(zone, { keepLocalTime: false });
  const safeEnd = end.setZone(zone, { keepLocalTime: false });

  return {
    start: safeStart.toFormat(format),
    end: safeEnd.toFormat(format),
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
}) => {
  const readableService = service?.title || service?.serviceTitle || "Training";
  const petDetails = (pets || []).map((pet, index) => {
    const name = escapeHtml(pet?.name || `Pet ${index + 1}`);
    const breed = escapeHtml(pet?.breed || "Breed pending");
    return `<li><strong>${name}</strong> (${breed})</li>`;
  });

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
      ${notesBlock}
       ${passwordBlock}
      <p style="margin: 16px 0 0;">If you need to reschedule or have questions, just reply to this email and we'll be happy to help.</p>
      <p style="margin: 8px 0 0;">Looking forward to seeing you soon!</p>
    </div>
  `;
};

const buildNotificationBody = ({ service, client, timing, notes, pets }) => {
  const readableService = service?.title || service?.serviceTitle || "Training";
  const petDetails = (pets || []).map((pet, index) => {
    const name = escapeHtml(pet?.name || `Pet ${index + 1}`);
    const breed = escapeHtml(pet?.breed || "Breed pending");
    return `<li><strong>${name}</strong> (${breed})</li>`;
  });

  const notesBlock = notes
    ? `<p style="margin: 16px 0 0;"><strong>Client notes:</strong><br>${escapeHtml(
        notes
      )}</p>`
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
      clientEmail,
      notes,
      timeZone = "UTC",
      pets = [],
      dogs = [],
      dogCount,
    } = body;

    if (!date || !time) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Missing date or time" }));
      return;
    }

    const petsFromBody = Array.isArray(pets) && pets.length ? pets : dogs || [];

    const bookingResult = await createBookingWithProfiles({
      date,
      time,
      durationMinutes,
      serviceId,
      serviceTitle,
      clientName,
      clientEmail,
      notes,
      timeZone,
      pets: petsFromBody,
      dogCount,
    });

    const timing = buildFriendlyTiming({
      start: DateTime.fromISO(bookingResult.booking.start_at, { zone: "UTC" }),
      end: DateTime.fromISO(bookingResult.booking.end_at, { zone: "UTC" }),
      timeZone,
    });

    const emailStatus = {
      confirmationSent: false,
      notificationCount: 0,
      skipped: false,
      error: null,
    };

    if (accessToken && calendarId && clientEmail) {
      try {
        const confirmationBody = buildConfirmationBody({
          clientName,
          timing,
          service: bookingResult.service || { serviceTitle },
          notes,
          pets: bookingResult.pets,
          passwordDelivery: bookingResult.passwordDelivery,
        });

        await sendMail({
          accessToken,
          fromCalendarId: calendarId,
          to: clientEmail,
          subject: bookingResult.service?.title || serviceTitle,
          body: confirmationBody,
          contentType: "HTML",
        });
        emailStatus.confirmationSent = true;

        const notificationRecipients = [
          process.env.BOOKING_NOTIFICATION_EMAIL,
          process.env.NOTIFY_EMAIL,
          process.env.JEROEN_AND_PAWS_EMAIL,
          "jeroen@jeroenandpaws.com",
        ].filter(Boolean);

        if (notificationRecipients.length) {
          const notificationBody = buildNotificationBody({
            service: bookingResult.service || { serviceTitle },
            client: bookingResult.client,
            timing,
            notes,
            pets: bookingResult.pets,
          });

          await sendMail({
            accessToken,
            fromCalendarId: calendarId,
            to: notificationRecipients,
            subject: `New booking: ${
              bookingResult.service?.title || serviceTitle
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
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        booking: bookingResult.booking,
        client: bookingResult.client,
        pets: bookingResult.pets,
        passwordDelivery: bookingResult.passwordDelivery,
        service: bookingResult.service || { title: serviceTitle },
        totals: bookingResult.totals,
        emailStatus,
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
