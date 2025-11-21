const normalizePhoneNumber = (phoneNumber) =>
  phoneNumber.replace(/^\+/, "").replace(/^00/, "");

export const getWhatsappClickToChatUrl = (phoneNumber, message) => {
  if (!phoneNumber) return null;
  const normalizedNumber = normalizePhoneNumber(phoneNumber);
  const formattedMessage = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalizedNumber}${formattedMessage}`;
};

const DEFAULT_WHATSAPP_CHAT_URL = getWhatsappClickToChatUrl("00353872473099");

export const getPreferredChatUrl = () =>
  process.env.NEXT_PUBLIC_WHATSAPP_CHAT_URL ||
  process.env.NEXT_PUBLIC_LIVE_CHAT_URL ||
  DEFAULT_WHATSAPP_CHAT_URL ||
  "/contact";