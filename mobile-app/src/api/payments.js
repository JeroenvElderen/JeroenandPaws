import { fetchJson } from "./client";

export const createPaymentSession = async (payload) =>
  fetchJson("/api/payments/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });