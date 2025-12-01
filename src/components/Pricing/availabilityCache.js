const availabilityCache = new Map();
const availabilityErrors = new Map();
const inflightRequests = new Map();

const computeApiBaseUrl = () => {
  const configured = (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "").replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  return "";
};

const buildAvailabilityUrl = (service, baseUrl = computeApiBaseUrl()) => {
  if (!service?.id) return "";
  const durationMinutes = Number.isFinite(service.durationMinutes)
    ? service.durationMinutes
    : 60;
  const sanitizedBase = (baseUrl || "").replace(/\/$/, "");
  return `${sanitizedBase}/api/availability?serviceId=${service.id}&durationMinutes=${durationMinutes}`;
};

const parseAvailabilityResponse = async (response, requestUrl) => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  const trimmed = text.trim();

  if (!response.ok) {
    const fallbackMessage = `Unable to load availability (${response.status})`;
    const message =
      trimmed && !trimmed.startsWith("<") ? trimmed : fallbackMessage;
    throw new Error(message);
  }

  const looksLikeJson =
    contentType.includes("application/json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed === "";

  if (!looksLikeJson) {
    throw new Error(
      `Received an unexpected response while loading availability. Please try again or use the contact form (source: ${requestUrl}).`
    );
  }

  try {
    return trimmed ? JSON.parse(trimmed) : {};
  } catch (parseError) {
    throw new Error(
      "Availability response could not be read. Please refresh and try again."
    );
  }
};

export const prefetchAvailability = async (service, baseUrl) => {
  if (!service?.id) return null;
  if (availabilityCache.has(service.id)) return availabilityCache.get(service.id);
  if (inflightRequests.has(service.id)) return inflightRequests.get(service.id);

  const requestUrl = buildAvailabilityUrl(service, baseUrl);
  const promise = fetch(requestUrl, { headers: { Accept: "application/json" } })
    .then((response) => parseAvailabilityResponse(response, requestUrl))
    .then((data) => {
      availabilityCache.set(service.id, data);
      availabilityErrors.delete(service.id);
      return data;
    })
    .catch((error) => {
      availabilityErrors.set(service.id, error);
      throw error;
    })
    .finally(() => {
      inflightRequests.delete(service.id);
    });

  inflightRequests.set(service.id, promise);
  return promise;
};

export const getCachedAvailability = (serviceId) =>
  serviceId ? availabilityCache.get(serviceId) : null;

export const getAvailabilityError = (serviceId) =>
  serviceId ? availabilityErrors.get(serviceId) : null;

export const clearAvailabilityCache = () => {
  availabilityCache.clear();
  availabilityErrors.clear();
  inflightRequests.clear();
};

export { computeApiBaseUrl };