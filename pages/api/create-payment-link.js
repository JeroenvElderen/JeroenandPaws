import { randomUUID } from "crypto";
import { supabase } from "../../api/_lib/supabase";

// pages/api/create-payment-link.js

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  console.log(">>> HIT /api/create-payment-link (LIVE)");

  try {
    const { amount, description, bookingId, redirectUrl, cancelUrl } = req.body;

    // 🔍 Check input
    console.log("💰 Amount received:", amount);
    console.log("📝 Description received:", description);

    if (!amount) {
      return res.status(400).json({ error: "Missing amount" });
    }

    // 🔑 Check environment variable
    const rawApiKey = process.env.REVOLUT_API_KEY;
    const apiKey = rawApiKey?.trim();
    console.log("🔐 Has REVOLUT_API_KEY?", Boolean(apiKey));
    console.log("🔑 Key prefix:", apiKey ? apiKey.substring(0, 3) : "undefined");

    if (!apiKey) {
      console.error("❌ Missing REVOLUT_API_KEY env var");
      return res
        .status(500)
        .json({ error: "Server misconfigured: missing Revolut API key" });
    }

    const revolutEnv = (process.env.REVOLUT_ENV || "live").toLowerCase();
    const revolutBaseUrl =
      revolutEnv === "sandbox"
        ? "https://sandbox-merchant.revolut.com"
        : "https://merchant.revolut.com";

    console.log("🏷 Revolut environment:", revolutEnv);

    const domain = process.env.DOMAIN || "https://www.jeroenandpaws.com";
    console.log("🌍 Domain:", domain);

    // 🚀 Request body
    const body = {
      amount: Math.round(amount * 100),
      currency: "EUR",
      description: description || "Payment",
      capture_mode: "AUTOMATIC",
      settle_payment: true,
      redirect_url:
        redirectUrl || `${domain}/payment-success${bookingId ? `?booking=${bookingId}` : ""}`,
      cancel_url:
        cancelUrl || `${domain}/payment-cancelled${bookingId ? `?booking=${bookingId}` : ""}`,
    };
    console.log("📦 Request body being sent:", body);

    // 🎯 Make request to Revolut
    console.log("🌐 Sending request to Revolut...");

    const idempotencyKey = randomUUID();
    console.log("🧩 Idempotency-Key:", idempotencyKey);

    const response = await fetch(`${revolutBaseUrl}/api/1.0/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Revolut-Api-Version": "2024-09-01",
        Authorization: `Bearer ${apiKey}`,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log("🔍 RAW Revolut response:", text);

    if (!response.ok) {
      console.error("❌ Revolut API error:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = JSON.parse(text);
    console.log("✅ CHECKOUT LINK CREATED:", data);

    const paymentOrderId = data.public_id || data.id;

    if (bookingId && paymentOrderId) {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ payment_order_id: paymentOrderId })
        .eq("id", bookingId);

      if (updateError) console.error("⚠️ Failed to link payment order", updateError);
      else console.log("🔗 Linked payment order to booking", bookingId);
    }

    return res.status(200).json({
      url: data.checkout_url,
      orderId: paymentOrderId,
    });
  } catch (err) {
    console.error("💥 Handler crashed:", err);
    return res.status(500).json({ error: err.message });
  }
}
