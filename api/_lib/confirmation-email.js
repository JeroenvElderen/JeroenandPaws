const BUSINESS_NAME =
  process.env.BUSINESS_NAME ||
  process.env.NEXT_PUBLIC_BUSINESS_NAME ||
  "Jeroen & Paws";
const BUSINESS_PHONE =
  process.env.BUSINESS_PHONE ||
  process.env.NEXT_PUBLIC_BUSINESS_PHONE ||
  "+353872473099";
const CANCELLATION_NOTICE_HOURS =
  process.env.CANCELLATION_NOTICE_HOURS || "24";
const SIGN_OFF_NAME =
  process.env.BUSINESS_SIGN_OFF ||
  process.env.BUSINESS_CONTACT_NAME ||
  BUSINESS_NAME;

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

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  } catch (error) {
    return `€${amount.toFixed(2)}`;
  }
};

const formatPetNames = (pets = []) => {
  const names = (pets || [])
    .map((pet) => (pet?.name || "").trim())
    .filter(Boolean);

  if (!names.length) return "your pet";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
};

const formatItemsToBring = (service) => {
  const items =
    service?.items_to_bring || service?.itemsToBring || service?.items;

  if (Array.isArray(items)) return items.filter(Boolean).join(", ");
  if (typeof items === "string" && items.trim()) return items.trim();

  const serviceLabel = `${service?.title || service?.serviceTitle || ""}`.toLowerCase();

  if (serviceLabel.includes("stroll") || serviceLabel.includes("walk")) {
    return "a leash";
  }
  if (serviceLabel.includes("journey") || serviceLabel.includes("hike")) {
    return "a leash, harness, water, and treats";
  }
  if (serviceLabel.includes("adventure")) {
    return "a leash, harness, water, and treats";
  }
  if (serviceLabel.includes("overnight") || serviceLabel.includes("boarding")) {
    return "a leash, toys, bed, bowls, and food";
  }
  if (serviceLabel.includes("daytime") || serviceLabel.includes("day care")) {
    return "a leash, toys, bed, bowls, and food";
  }
  if (serviceLabel.includes("check-in") || serviceLabel.includes("home visit")) {
    return "house access instructions, food, bowls, and any medication";
  }
  if (serviceLabel.includes("training") || serviceLabel.includes("lesson")) {
    return "a leash, treats, and a favorite toy";
  }
  if (serviceLabel.includes("custom")) {
    return "a leash, treats, and any requested items";
  }
  return "a leash, treats, and toys";
};

const resolveBodyIntro = (serviceLabel = "") => {
  const normalized = serviceLabel.toLowerCase();
  if (normalized.includes("stroll") || normalized.includes("walk")) {
    return "Your walk";
  }
  if (normalized.includes("journey") || normalized.includes("hike")) {
    return "Your hike";
  }
  if (normalized.includes("adventure")) {
    return "Your adventure";
  }
  if (normalized.includes("overnight") || normalized.includes("boarding")) {
    return "Your overnight stay";
  }
  if (normalized.includes("daytime") || normalized.includes("day care")) {
    return "Your day care visit";
  }
  if (normalized.includes("check-in") || normalized.includes("home visit")) {
    return "Your check-in";
  }
  if (normalized.includes("training") || normalized.includes("lesson")) {
    return "Your training session";
  }
  if (normalized.includes("custom")) {
    return "Your custom session";
  }
  return "Your session";
};

const buildBookingSummary = ({ timing, service, additionals, amount }) => {
  const lines = [];
  const totalAmount = formatCurrency(amount);

  lines.push(
    `<li><strong>Service:</strong> ${escapeHtml(
      service?.title || service?.serviceTitle || "Service"
    )}</li>`
  );

  if (additionals?.length) {
    lines.push(
      `<li><strong>Extras:</strong> ${additionals
        .map((item) => escapeHtml(item))
        .join(", ")}</li>`
    );
  }

  if (totalAmount) {
    lines.push(`<li><strong>Total:</strong> ${escapeHtml(totalAmount)}</li>`);
  }

  if (timing?.start) {
    lines.push(
      `<li><strong>Scheduled:</strong> ${escapeHtml(timing.start)}</li>`
    );
  }

  return lines.length
    ? `<p style="margin:16px 0 8px;"><strong>Booking summary:</strong></p>
       <ul style="margin:0;padding-left:20px;">${lines.join("")}</ul>`
    : "";
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
  amount,
}) => {
  const petNames = formatPetNames(pets);
  const petNamesEscaped = escapeHtml(petNames);
  const itemsToBring = escapeHtml(formatItemsToBring(service));
  const serviceLabel =
    service?.title || service?.serviceTitle || "session";
  const serviceIntro = resolveBodyIntro(serviceLabel);
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

  const recurrenceBlock = formatRecurrenceMessage(recurrence)
    ? `<p style="margin:12px 0 0;">${formatRecurrenceMessage(
        recurrence
      )}</p>`
    : "";

  const bookingSummaryBlock = buildBookingSummary({
    timing,
    service,
    additionals,
    amount,
  });

  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
    <p style="margin:0 0 12px;">Hi ${escapeHtml(clientName || "there")},</p>
    <p style="margin:0 0 12px;">
      We’re excited to work with you and ${petNamesEscaped}! ${escapeHtml(
    serviceIntro
  )} for ${escapeHtml(serviceLabel)} is scheduled for ${escapeHtml(
    timing.start
  )}${
    clientAddress ? `, and we’ll meet at ${escapeHtml(clientAddress)}.` : "."
  }
    </p>
    <p style="margin:0 0 12px;">
      Bring along ${itemsToBring}, and let us know if you have any specific goals for this session.
    </p>
    <p style="margin:0 0 12px;">
      If you need to reschedule or cancel, please give us at least ${escapeHtml(
        CANCELLATION_NOTICE_HOURS
      )} hours notice by calling or sending a text message to ${escapeHtml(
    BUSINESS_PHONE
  )}.
    </p>
    ${bookingSummaryBlock}
    <p style="margin:12px 0 8px;"><strong>Pets:</strong></p>
    ${petsBlock}
    ${renderScheduleBlock(schedule)}
    ${recurrenceBlock}
    ${additionalsBlock}
    ${notesBlock}
    ${passwordBlock}
    <p style="margin:16px 0 0;">Looking forward to helping ${petNamesEscaped} shine!</p>
    <p style="margin:8px 0 0;">Best,<br>${escapeHtml(SIGN_OFF_NAME)}</p>
  </div>`;
};

const buildNotificationBody = ({
  service,
  client,
  timing,
  notes,
  pets,
  schedule = [],
  recurrence = "",
  additionals = [],
  paymentPreference,
  paymentReference,
}) => {
  const readableService = service?.title || service?.serviceTitle || "Service";
  const petDetails = renderPetList(pets, { includePhotos: true });
  const notesBlock = notes
    ? `<p style="margin:16px 0 0;">
         <strong>Client notes:</strong><br>${escapeHtml(notes)}
       </p>`
    : "";

  const paymentBlock = paymentPreference
    ? `<li><strong>Payment:</strong> ${escapeHtml(
        paymentPreference === "invoice" ? "Invoice requested" : "Pay now"
      )}</li>`
    : "";

  const paymentReferenceBlock = paymentReference
    ? `<li><strong>Payment reference:</strong> ${escapeHtml(
        paymentReference
      )}</li>`
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
      ${paymentBlock}
      ${paymentReferenceBlock}
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

const resolveSubjectPrompt = (serviceLabel = "") => {
  const normalized = serviceLabel.toLowerCase();
  if (normalized.includes("stroll") || normalized.includes("walk")) {
    return "Ready to walk?";
  }
  if (normalized.includes("journey") || normalized.includes("hike")) {
    return "Ready to hike?";
  }
  if (normalized.includes("adventure")) {
    return "Ready for an adventure?";
  }
  if (normalized.includes("overnight") || normalized.includes("boarding")) {
    return "Ready for an overnight stay?";
  }
  if (normalized.includes("daytime") || normalized.includes("day care")) {
    return "Ready for day care?";
  }
  if (normalized.includes("check-in") || normalized.includes("home visit")) {
    return "Ready for a check-in?";
  }
  if (normalized.includes("training") || normalized.includes("lesson")) {
    return "Ready to learn?";
  }
  if (normalized.includes("custom")) {
    return "Ready to plan?";
  }
  return "Ready to get started?";
};

const buildConfirmationSubject = ({ pets, service }) => {
  const petNames = formatPetNames(pets);
  const petPossessive =
    petNames === "your pet" ? "Your pet’s" : `${petNames}’s`;
  const serviceLabel = service?.title || service?.serviceTitle || "";
  const prompt = resolveSubjectPrompt(serviceLabel);
  return `${prompt} ${petPossessive} ${serviceLabel || "session"} at ${BUSINESS_NAME}`;
};

const buildPaymentLinkSubject = ({ serviceTitle } = {}) =>
  `Complete your payment for ${serviceTitle || "your booking"} at ${BUSINESS_NAME}`;

const buildPaymentLinkBody = ({ clientName, serviceTitle, paymentLink }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
    <p style="margin:0 0 12px;">Hi ${escapeHtml(clientName || "there")},</p>
    <p style="margin:0 0 12px;">
      Your booking for <strong>${escapeHtml(
        serviceTitle || "your service"
      )}</strong> is still waiting for payment.
    </p>
    <p style="margin:0 0 12px;">
      Please complete payment using this link within 24 hours:
    </p>
    <p style="margin:0 0 16px;word-break:break-all;">
      <a href="${escapeHtml(paymentLink)}" style="color:#111827;">${escapeHtml(
        paymentLink
      )}</a>
    </p>
    <p style="margin:0;">Thanks,<br>${escapeHtml(SIGN_OFF_NAME)}</p>
  </div>`;

module.exports = {
  buildConfirmationBody,
  buildNotificationBody,
  buildConfirmationSubject,
  buildPaymentLinkBody,
  buildPaymentLinkSubject,
};