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

const getServiceLabel = (serviceTitle) => serviceTitle || "Service";

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

const buildCalendarBody = ({ serviceTitle, status }) => {
  const statusLabel = CALENDAR_STATUS[status] || status || "Booking";
  return `Status: ${statusLabel}\nService: ${getServiceLabel(serviceTitle)}`;
};

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
  buildCalendarSubject,
  buildCalendarCategories,
  CALENDAR_STATUS,
};