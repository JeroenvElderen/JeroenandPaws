// pages/api/_lib/emails.js

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatRecurrenceMessage = (recurrence) => {
  switch (recurrence) {
    case "weekly":
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

const renderPetList = (pets = [], { includePhotos = false } = {}) =>
  (pets || []).map((pet, index) => {
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
      ? `<div style="margin:6px 0 0;">
          <img src="${photoSrc}" alt="${name} photo"
          style="width:140px;max-width:100%;border-radius:12px;object-fit:cover;" />
         </div>`
      : "";

    return `<li><strong>${name}</strong> (${breed})${photoBlock}</li>`;
  });

const renderScheduleBlock = (schedule = []) => {
  if (!schedule.length) return "";
  return `
    <p style="margin:12px 0 8px;"><strong>Schedule:</strong></p>
    <ul style="margin:0;padding-left:20px;">
      ${schedule
        .map(
          (item, index) =>
            `<li><strong>${escapeHtml(
              item.label || `Visit ${index + 1}`
            )}</strong> — ${escapeHtml(item.start)}${
              item.end ? ` (ends ${escapeHtml(item.end)})` : ""
            }</li>`
        )
        .join("")}
    </ul>`;
};

// -------------------------------------------
// 📧 CLIENT CONFIRMATION EMAIL
// -------------------------------------------

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
  const readableService = service?.title || service?.serviceTitle || "Service";
  const petDetails = renderPetList(pets);
  const additionalsBlock = additionals.length
    ? `<p style="margin:12px 0 0;"><strong>Extras:</strong></p>
       <ul style="margin:0;padding-left:20px;">
         ${additionals.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
       </ul>`
    : "";

  const notesBlock = notes
    ? `<p style="margin:16px 0 0;">
         <strong>Notes from you:</strong><br>${escapeHtml(notes)}
       </p>`
    : "";

  const passwordBlock = passwordDelivery
    ? `<p style="margin:16px 0 0;">
         An account has been created for you so you can update bookings and pets later.
         Use this temporary password: <strong>${escapeHtml(
           passwordDelivery?.temporaryPassword
         )}</strong>.
       </p>`
    : "";

  const petsBlock =
    petDetails.length > 0
      ? `<ol style="margin:0;padding-left:20px;">${petDetails.join("")}</ol>`
      : `<p style="margin:8px 0 0;">No pets were added yet.</p>`;

  const addressBlock = clientAddress
    ? `<p style="margin:12px 0 0;"><strong>Address:</strong><br>${escapeHtml(
        clientAddress
      )}</p>`
    : "";

  const recurrenceBlock = formatRecurrenceMessage(recurrence)
    ? `<p style="margin:12px 0 0;">${formatRecurrenceMessage(
        recurrence
      )}</p>`
    : "";

  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
    <p style="margin:0 0 12px;">Hi ${escapeHtml(clientName || "there")},</p>
    <p style="margin:0 0 12px;">
      Thank you for booking <strong>${escapeHtml(
        readableService
      )}</strong>. Here are your appointment details:
    </p>
    <ul style="padding-left:20px;margin:0 0 12px;">
      <li><strong>Starts:</strong> ${escapeHtml(timing.start)}</li>
      <li><strong>Ends:</strong> ${escapeHtml(timing.end)}</li>
      <li><strong>Time zone:</strong> ${escapeHtml(timing.timeZone)}</li>
    </ul>
    <p style="margin:12px 0 8px;"><strong>Pets:</strong></p>
    ${petsBlock}
    ${addressBlock}
    ${renderScheduleBlock(schedule)}
    ${recurrenceBlock}
    ${additionalsBlock}
    ${notesBlock}
    ${passwordBlock}
    <p style="margin:16px 0 0;">Looking forward to seeing you soon!</p>
  </div>`;
};

// -------------------------------------------
// 📧 ADMIN NOTIFICATION EMAIL
// -------------------------------------------

const buildNotificationBody = ({
  service,
  client,
  timing,
  notes,
  pets,
  schedule = [],
  recurrence = "",
  additionals = [],
}) => {
  const readableService = service?.title || service?.serviceTitle || "Service";
  const petDetails = renderPetList(pets, { includePhotos: true });
  const notesBlock = notes
    ? `<p style="margin:16px 0 0;">
         <strong>Client notes:</strong><br>${escapeHtml(notes)}
       </p>`
    : "";

  const addressBlock = client?.address
    ? `<p style="margin:12px 0 0;"><strong>Address:</strong><br>${escapeHtml(
        client.address
      )}</p>`
    : "";

  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
    <p style="margin:0 0 12px;">New booking received:</p>
    <ul style="padding-left:20px;margin:0 0 12px;">
      <li><strong>Client:</strong> ${escapeHtml(
        client.full_name || client.email
      )}</li>
      <li><strong>Email:</strong> ${escapeHtml(client.email)}</li>
      <li><strong>Service:</strong> ${escapeHtml(readableService)}</li>
      <li><strong>Starts:</strong> ${escapeHtml(timing.start)}</li>
      <li><strong>Ends:</strong> ${escapeHtml(timing.end)}</li>
      <li><strong>Time zone:</strong> ${escapeHtml(timing.timeZone)}</li>
    </ul>
    <p><strong>Pets:</strong></p>
    <ol style="margin:0;padding-left:20px;">${petDetails.join("")}</ol>
    ${notesBlock}
    ${addressBlock}
    ${renderScheduleBlock(schedule)}
    ${additionals.length
      ? `<p><strong>Extras:</strong> ${additionals.join(", ")}</p>`
      : ""}
    ${
      recurrence
        ? `<p style="margin:12px 0 0;">${formatRecurrenceMessage(
            recurrence
          )}</p>`
        : ""
    }
    <p style="margin:20px 0 0;">This is an internal admin notification.</p>
  </div>`;
};

module.exports = { buildConfirmationBody, buildNotificationBody };
