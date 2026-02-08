import { API_BASE_URL } from "./config";

export const fetchJson = async (
  path,
  { timeoutMs = 15000, headers, ...fetchOptions } = {}
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
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

  return response.json();
};