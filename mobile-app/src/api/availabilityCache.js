import { fetchJson } from "./client";

const CACHE_TTL_MS = 5 * 60 * 1000;
const availabilityCache = new Map();

const buildCacheKey = ({ durationMinutes, windowDays, clientAddress }) => {
  const safeDuration = Number(durationMinutes) || 0;
  const safeWindow = Number(windowDays) || 0;
  const normalizedAddress = (clientAddress || "").trim().toLowerCase();
  return `${safeDuration}:${safeWindow}:${normalizedAddress}`;
};

export const getCachedAvailability = ({
  durationMinutes,
  windowDays,
  clientAddress,
}) => {
  const key = buildCacheKey({ durationMinutes, windowDays, clientAddress });
  const cached = availabilityCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    availabilityCache.delete(key);
    return null;
  }
  return cached.data;
};

export const setCachedAvailability = ({
  durationMinutes,
  windowDays,
  clientAddress,
  data,
}) => {
  const key = buildCacheKey({ durationMinutes, windowDays, clientAddress });
  availabilityCache.set(key, { timestamp: Date.now(), data });
};

export const prefetchAvailability = async ({
  durationMinutes = 60,
  windowDays = 21,
  clientAddress,
}) => {
  const trimmedAddress = (clientAddress || "").trim();
  if (!trimmedAddress) return null;
  const cached = getCachedAvailability({
    durationMinutes,
    windowDays,
    clientAddress: trimmedAddress,
  });
  if (cached) return cached;
  const data = await fetchJson(
    `/api/availability?durationMinutes=${durationMinutes}&windowDays=${windowDays}&clientAddress=${encodeURIComponent(
      trimmedAddress
    )}`
  );
  setCachedAvailability({
    durationMinutes,
    windowDays,
    clientAddress: trimmedAddress,
    data,
  });
  return data;
};

export const clearAvailabilityCache = () => {
  availabilityCache.clear();
};