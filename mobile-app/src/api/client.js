import { API_BASE_URL } from "./config";

const responseCache = new Map();

const clonePayload = (payload) => {
  if (payload === null || payload === undefined) {
    return payload;
  }

  return JSON.parse(JSON.stringify(payload));
};

const normalizeCacheKey = (path, method = "GET") =>
  `${String(method || "GET").toUpperCase()}:${path}`;

export const primeFetchJsonCache = (path, payload, { method = "GET" } = {}) => {
  const key = normalizeCacheKey(path, method);
  responseCache.set(key, {
    payload: clonePayload(payload),
    updatedAt: Date.now(),
  });
};

export const clearFetchJsonCache = () => {
  responseCache.clear();
};

export const fetchJson = async (
  path,
  {
    timeoutMs = 15000,
    headers,
    method = "GET",
    useCache = true,
    forceRefresh = false,
    ...fetchOptions
  } = {}
) => {
  const requestMethod = String(method || fetchOptions.method || "GET").toUpperCase();
  const cacheKey = normalizeCacheKey(path, requestMethod);
  const isGetRequest = requestMethod === "GET";

  if (isGetRequest && useCache && !forceRefresh) {
    const cached = responseCache.get(cacheKey);
    if (cached?.payload !== undefined) {
      return clonePayload(cached.payload);
    }
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: requestMethod,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...headers,
      },
      ...fetchOptions,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text();
    let message = body;

    if (body) {
      try {
        const parsed = JSON.parse(body);
        message = parsed?.message || body;
      } catch (error) {
        message = body;
      }
    }
    
    throw new Error(message || `Request failed with ${response.status}`);
  }

  const payload = await response.json();

  if (isGetRequest && useCache) {
    responseCache.set(cacheKey, {
      payload: clonePayload(payload),
      updatedAt: Date.now(),
    });
  }

  return payload;
};