const availabilityCache = new Map();
const availabilityErrors = new Map();
const inflightRequests = new Map();
const inflightBatchRequests = new Map();

const DEFAULT_AVAILABILITY_WINDOW_DAYS = 90;

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
  return `${sanitizedBase}/api/availability?serviceId=${service.id}&durationMinutes=${durationMinutes}&windowDays=${DEFAULT_AVAILABILITY_WINDOW_DAYS}`;
};

const buildAvailabilityBatchUrl = (services, baseUrl = computeApiBaseUrl()) => {
  if (!services?.length) return "";
  const sanitizedBase = (baseUrl || "").replace(/\/$/, "");
  const payload = services.map((service) => ({
    id: service.id,
    durationMinutes: Number.isFinite(service.durationMinutes)
      ? service.durationMinutes
      : 60,
  }));
  return `${sanitizedBase}/api/availability-batch?services=${encodeURIComponent(
    JSON.stringify(payload)
  )}&windowDays=${DEFAULT_AVAILABILITY_WINDOW_DAYS}`;
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

const parseAvailabilityBatchResponse = async (response, requestUrl) => {
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

export const prefetchAvailabilityBatch = async (services, baseUrl) => {
  const normalized = (services || [])
    .map((service) => ({
      id: service?.id ? String(service.id) : "",
      durationMinutes: Number.isFinite(service?.durationMinutes)
        ? service.durationMinutes
        : 60,
    }))
    .filter((service) => service.id);

  if (!normalized.length) return null;

  const pending = normalized.filter(
    (service) =>
      !availabilityCache.has(service.id) &&
      !inflightRequests.has(service.id)
  );

  if (!pending.length) {
    return Promise.all(
      normalized.map((service) => {
        if (availabilityCache.has(service.id)) {
          return Promise.resolve(availabilityCache.get(service.id));
        }
        return inflightRequests.get(service.id);
      })
    );
  }

  const batchKey = pending.map((service) => service.id).sort().join("|");
  if (inflightBatchRequests.has(batchKey)) {
    return inflightBatchRequests.get(batchKey);
  }

  const requestUrl = buildAvailabilityBatchUrl(pending, baseUrl);
  const promise = fetch(requestUrl, { headers: { Accept: "application/json" } })
    .then((response) => parseAvailabilityBatchResponse(response, requestUrl))
    .then((data) => {
      const availability = data?.availability || {};
      const errors = data?.errors || {};

      pending.forEach((service) => {
        if (availability[service.id]) {
          availabilityCache.set(service.id, availability[service.id]);
          availabilityErrors.delete(service.id);
        } else if (errors[service.id]) {
          availabilityErrors.set(service.id, new Error(errors[service.id]));
        }
      });

      return availability;
    })
    .catch((error) => {
      pending.forEach((service) => {
        availabilityErrors.set(service.id, error);
      });
      throw error;
    })
    .finally(() => {
      pending.forEach((service) => {
        inflightRequests.delete(service.id);
      });
      inflightBatchRequests.delete(batchKey);
    });

  pending.forEach((service) => {
    inflightRequests.set(service.id, promise);
  });
  inflightBatchRequests.set(batchKey, promise);

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
  inflightBatchRequests.clear();
};

export { computeApiBaseUrl };