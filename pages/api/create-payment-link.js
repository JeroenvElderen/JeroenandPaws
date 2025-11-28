import { supabase } from "../../api/_lib/supabase";

export default async function handler(req, res) {
  console.log(">>> HIT /api/create-payment-link (LIVE)");

  try {
    const { amount, description, bookingId } = req.body;
    if (!amount || !bookingId) {
      return res.status(400).json({ error: "Missing amount or bookingId" });
    }

    const apiKey = process.env.REVOLUT_API_KEY;
    const domain = process.env.DOMAIN || "https://www.jeroenandpaws.com";

    const body = {
      amount: Math.round(amount * 100), // cents
      currency: "EUR",
      description,
      capture_mode: "AUTOMATIC",
      merchant_order_ext_ref: bookingId,
      redirect_url: `${domain}/payment-success`,
    };

    const response = await fetch(
  "https://merchant.revolut.com/api/1.0/merchant/checkout-link",
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

    return res.status(200).json({ url: data.public_url });
  } catch (err) {
  console.error("💥 create-payment-link error:", err);
  return res.status(500).json({ error: err.message || err });
}
}

