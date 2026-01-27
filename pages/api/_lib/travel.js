const { DateTime } = require("luxon");

const DEFAULT_HOME_ADDRESS =
  process.env.TRAVEL_HOME_ADDRESS ||
  process.env.HOME_BASE_ADDRESS ||
  "9 Rosslyn Grove, A98H940, Bray";

const DEFAULT_MIN_TRAVEL_MINUTES = Number.parseInt(
  process.env.DEFAULT_TRAVEL_MINUTES || "20",
  10
);
const AVERAGE_TRAVEL_SPEED_KMH = Number.parseInt(
  process.env.AVERAGE_TRAVEL_SPEED_KMH || "30",
  10
);
const TRAVEL_PADDING_MINUTES = Number.parseInt(
  process.env.TRAVEL_PADDING_MINUTES || "10",
  10
);

const geocodeCache = new Map();

const haversineDistanceKm = (from, to) => {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const R = 6371;

  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const geocodeAddress = async (address) => {
  const trimmed = (address || "").trim();
  if (!trimmed) return null;

  if (geocodeCache.has(trimmed.toLowerCase())) {
    return geocodeCache.get(trimmed.toLowerCase());
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        trimmed
      )}`,
      {
        headers: {
          "User-Agent": "jeroenandpaws-bookings/1.0",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const match = Array.isArray(data) ? data[0] : null;

    if (!match?.lat || !match?.lon) return null;

    const coords = { lat: Number(match.lat), lon: Number(match.lon) };
    geocodeCache.set(trimmed.toLowerCase(), coords);
    return coords;
  } catch (error) {
    console.error("Geocoding failed", { address: trimmed, error });
    return null;
  }
};

const estimateTravelMinutes = async (fromAddress, toAddress) => {
  const fromCoords = await geocodeAddress(fromAddress);
  const toCoords = await geocodeAddress(toAddress);

  if (!fromCoords || !toCoords) {
    return DEFAULT_MIN_TRAVEL_MINUTES;
  }

  const distanceKm = haversineDistanceKm(fromCoords, toCoords);
  const speed = Math.max(10, AVERAGE_TRAVEL_SPEED_KMH);
  const minutes = (distanceKm / speed) * 60;

  return Math.ceil(minutes + TRAVEL_PADDING_MINUTES);
};

const validateTravelWindow = async ({
  start,
  end,
  clientAddress,
  previousBooking,
  nextBooking,
  baseAddress = DEFAULT_HOME_ADDRESS,
}) => {
  const issues = [];
  const startUtc = DateTime.fromISO(start.toUTC().toISO(), { zone: "UTC" });
  const endUtc = DateTime.fromISO(end.toUTC().toISO(), { zone: "UTC" });
  const clientLocation = (clientAddress || "").trim();

  const previousAddress =
    previousBooking?.client_address?.trim() || baseAddress || "";
  const nextAddress = nextBooking?.client_address?.trim() || baseAddress || "";

  if (previousBooking) {
    const previousEnd = DateTime.fromISO(previousBooking.end_at, { zone: "UTC" });
    const travelMinutes = await estimateTravelMinutes(
      previousAddress || baseAddress,
      clientLocation
    );
    const availableGap = startUtc.diff(previousEnd, "minutes").as("minutes");

    if (availableGap < travelMinutes) {
      issues.push(
        `We need about ${Math.ceil(
          travelMinutes
        )} minutes to travel from our last booking before arriving here. Please choose a later start time.`
      );
    }
  }

  if (nextBooking) {
    const nextStart = DateTime.fromISO(nextBooking.start_at, { zone: "UTC" });
    const travelMinutes = await estimateTravelMinutes(
      clientLocation,
      nextAddress || baseAddress
    );
    const availableGap = nextStart.diff(endUtc, "minutes").as("minutes");

    if (availableGap < travelMinutes) {
      issues.push(
        `We need about ${Math.ceil(
          travelMinutes
        )} minutes to reach our next booking afterwards. Please choose an earlier time or another day.`
      );
    }
  }

  return {
    ok: issues.length === 0,
    message: issues.join(" ").trim(),
  };
};

module.exports = {
  DEFAULT_HOME_ADDRESS,
  DEFAULT_MIN_TRAVEL_MINUTES,
  estimateTravelMinutes,
  validateTravelWindow,
};