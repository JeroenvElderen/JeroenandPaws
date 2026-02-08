import { fetchJson } from "./client";

export const createPaymentSession = async (payload) =>
  fetchJson("/api/create-payment-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });