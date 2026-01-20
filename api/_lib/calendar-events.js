const COMPANY_PREFIX = "J&P";

const CALENDAR_STATUS = {
  pending: "Pending payment",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
};

const CALENDAR_CATEGORIES = {
  pending:
    process.env.OUTLOOK_PENDING_PAYMENT_CATEGORY ||
    "J&P Pending (Yellow)",
  confirmed:
    process.env.OUTLOOK_PAID_BOOKING_CATEGORY ||
    "J&P Confirmed (Green)",
  rescheduled:
    process.env.OUTLOOK_RESCHEDULED_BOOKING_CATEGORY ||
    "J&P Rescheduled (Blue)",
  cancelled:
    process.env.OUTLOOK_CANCELLED_BOOKING_CATEGORY ||
    "J&P Cancelled (Red)",
};

const SERVICE_COLOR_NAMES = [
  "Blue",
  "Purple",
  "Orange",
  "Teal",
  "Pink",
  "Brown",
  "Navy",
  "Steel",
];

const EIRCODE_FULL_REGEX = /\b([AC-FHKNPRTV-Y]\d{2}[AC-FHKNPRTV-Y0-9]{4})\b/i;
const EIRCODE_ROUTING_REGEX = /\b([AC-FHKNPRTV-Y]\d{2})\b/i;

const getServiceLabel = (serviceTitle) => serviceTitle || "Service";

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeEircode = (value) =>
  normalizeString(value).toUpperCase().replace(/\s+/g, "");

const hashString = (value) =>
  String(value || "")
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

const getServiceColor = (serviceTitle) => {
  const index = hashString(serviceTitle) % SERVICE_COLOR_NAMES.length;
  return SERVICE_COLOR_NAMES[index];
};

const buildCalendarSubject = ({ serviceTitle, status }) => {
  const statusLabel = CALENDAR_STATUS[status] || status || "Booking";
  return `${COMPANY_PREFIX} • ${getServiceLabel(serviceTitle)} • ${statusLabel}`;
};

const extractEircode = (value = "") => {
  const trimmed = normalizeString(value).toUpperCase();
  if (!trimmed) return "";
  const fullMatch = trimmed.match(EIRCODE_FULL_REGEX);
  if (fullMatch) return fullMatch[1];
  const routingMatch = trimmed.match(EIRCODE_ROUTING_REGEX);
  return routingMatch ? routingMatch[1] : "";
};

const resolveCalendarLocationDisplayName = ({
  clientAddress,
  clientEircode,
} = {}) => {
  const eircode = normalizeEircode(clientEircode) || extractEircode(clientAddress);
  return eircode || normalizeString(clientAddress);
};

const formatPets = (pets = []) => {
  if (!pets) return "";
  if (Array.isArray(pets)) {
    const names = pets
      .map((pet) => normalizeString(pet?.name || pet))
      .filter(Boolean);
    return names.join(", ");
  }
  if (typeof pets === "string") return pets.trim();
  return "";
};

const formatSchedule = (schedule = []) => {
  if (!Array.isArray(schedule) || schedule.length === 0) return "";
  return schedule
    .map((item, index) => {
      const label = normalizeString(item?.label) || `Visit ${index + 1}`;
      const start = normalizeString(item?.start);
      const end = normalizeString(item?.end);
      if (!start && !end) return "";
      return `${label}: ${start}${end ? ` (ends ${end})` : ""}`.trim();
    })
    .filter(Boolean)
    .join(" | ");
};

const buildCalendarBody = ({
  serviceTitle,
  status,
  paymentLink,
  clientName,
  clientPhone,
  clientEmail,
  clientAddress,
  clientEircode,
  notes,
  pets,
  schedule,
  additionals,
}) => {
  const statusLabel = CALENDAR_STATUS[status] || status || "Booking";
  const lines = [
    `Status: ${statusLabel}`,
    `Service: ${getServiceLabel(serviceTitle)}`,
  ];

  if (clientName) lines.push(`Client: ${normalizeString(clientName)}`);
  if (clientPhone) lines.push(`Phone: ${normalizeString(clientPhone)}`);
  if (clientEmail) lines.push(`Email: ${normalizeString(clientEmail)}`);

  const resolvedEircode =
    normalizeEircode(clientEircode) || extractEircode(clientAddress);
  if (resolvedEircode) lines.push(`Eircode: ${resolvedEircode}`);
  if (clientAddress) lines.push(`Address: ${normalizeString(clientAddress)}`);

  const petSummary = formatPets(pets);
  if (petSummary) lines.push(`Pets: ${petSummary}`);

  if (additionals?.length) {
    lines.push(`Extras: ${(additionals || []).filter(Boolean).join(", ")}`);
  }

  const scheduleSummary = formatSchedule(schedule);
  if (scheduleSummary) lines.push(`Schedule: ${scheduleSummary}`);

  if (notes) lines.push(`Notes: ${normalizeString(notes)}`);
  
  if (paymentLink) {
    lines.push(`Payment link: ${paymentLink}`);
  }

  return lines.join("\n");
};

const buildClientCalendarBody = () => "";

const getCalendarCategory = (status) =>
  CALENDAR_CATEGORIES[status] || CALENDAR_CATEGORIES.confirmed;

const getServiceCategory = (serviceTitle) => {
  const label = getServiceLabel(serviceTitle);
  const color = getServiceColor(label);
  return `${COMPANY_PREFIX} Service • ${label} (${color})`;
};

const buildCalendarCategories = ({ status, serviceTitle }) => {
  const categories = [getCalendarCategory(status), getServiceCategory(serviceTitle)];
  return [...new Set(categories)];
};

module.exports = {
  buildCalendarBody,
  buildClientCalendarBody,
  buildCalendarSubject,
  buildCalendarCategories,
  resolveCalendarLocationDisplayName,
  CALENDAR_STATUS,
};