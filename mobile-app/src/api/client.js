import { API_BASE_URL } from "./config";

export const fetchJson = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`);

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