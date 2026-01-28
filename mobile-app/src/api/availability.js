import { fetchJson } from "./client";

export const DEFAULT_AVAILABILITY_WINDOW_DAYS = 21;

export const fetchAvailability = async ({
  durationMinutes = 60,
  windowDays = DEFAULT_AVAILABILITY_WINDOW_DAYS,
  clientAddress,
  timeoutMs,
} = {}) => {
  const trimmedAddress = (clientAddress || "").trim();
  if (!trimmedAddress) {
    throw new Error("Client address is required.");
  }
  const safeDurationMinutes = Number(durationMinutes) || 60;
  const safeWindowDays = Number(windowDays) || DEFAULT_AVAILABILITY_WINDOW_DAYS;

  return fetchJson(
    `/api/availability?durationMinutes=${safeDurationMinutes}&windowDays=${safeWindowDays}&clientAddress=${encodeURIComponent(
      trimmedAddress
    )}`,
    { timeoutMs }
  );
};