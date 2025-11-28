import { supabase } from "../../api/_lib/supabase";

export default async function handler(req, res) {
  console.log(">>> HIT /api/create-payment-link (LIVE)");

  try {
    const { amount, description } = req.body; // ⬅️ bookingId removed
    if (!amount) {
      return res.status(400).json({ error: "Missing amount" });
    }

    const apiKey = process.env.REVOLUT_API_KEY;
    const domain = process.env.DOMAIN || "https://www.jeroenandpaws.com";

    const body = {
      amount: {
        value: Math.round(amount * 100),
        currency: "EUR",
      },
      capture_mode: "AUTOMATIC",
      description,
      settle_payment: true,
      redirect_url: `${domain}/payment-success`,
    };

    const response = await fetch(
  "https://merchant.revolut.com/api/1.0/checkout-links",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  }
);

    const text = await response.text();
    console.log("🔍 Revolut response:", text);

    if (!response.ok) {
      console.error("❌ Revolut API error:", text);
      return res.status(500).json({ error: text });
    }

    const data = JSON.parse(text);
    console.log("✅ CHECKOUT LINK CREATED:", data);

    return res.status(200).json({
      url: data.checkout_url,          // link to redirect user
      orderId: data.public_id || data.id, // Revolut order reference
    });
  } catch (err) {
    console.error("💥 create-payment-link error:", err);
    return res.status(500).json({ error: err.message || err });
  }
}
