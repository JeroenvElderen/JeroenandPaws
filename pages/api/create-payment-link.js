import { supabase } from "../../api/_lib/supabase";

// pages/api/create-payment-link.js

export default async function handler(req, res) {
  console.log(">>> HIT /api/create-payment-link (LIVE)");

  try {
    const { amount, description } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Missing amount" });
    }

    // Revolut secret key (live)
    const apiKey = process.env.REVOLUT_API_KEY;
    const domain = process.env.DOMAIN || "https://www.jeroenandpaws.com";

    // 🚀 Correct payload format (NO nested amount object)
    const body = {
      amount: Math.round(amount * 100), // cents
      currency: "EUR",
      description: description || "Payment",
      capture_mode: "AUTOMATIC",      // optional but valid
      settle_payment: true,           // auto-settle after capture
      redirect_url: `${domain}/payment-success`,
      cancel_url: `${domain}/payment-cancelled`, // OPTIONAL but recommended
    };

    const response = await fetch(
      "https://merchant.revolut.com/api/1.0/checkout-links",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          // 🔥 REQUIRED — prevents silent Revolut errors
          "Revolut-Api-Version": "2024-09-01",

          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      }
    );

    const text = await response.text();
    console.log("🔍 RAW Revolut response:", text);

    if (!response.ok) {
      console.error("❌ Revolut API error:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = JSON.parse(text);
    console.log("✅ CHECKOUT LINK CREATED:", data);

    return res.status(200).json({
      url: data.checkout_url,
      orderId: data.public_id || data.id,
    });
  } catch (err) {
    console.error("💥 Handler crashed:", err);
    return res.status(500).json({ error: err.message });
  }
}
