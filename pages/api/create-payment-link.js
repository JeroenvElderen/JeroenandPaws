export default async function handler(req, res) {
  console.log(">>> HIT /api/create-payment-link (LIVE)");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
    }

  try {
    const { amount, description } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: "Missing amount or description" });
    }

    // 🔑 Your Revolut API key
    const apiKey = process.env.REVOLUT_API_KEY;
    if (!apiKey) {
      throw new Error("REVOLUT_API_KEY missing in env");
    }

    // 1️⃣ Create a Payment Order
    const orderRes = await fetch("https://merchant.revolut.com/api/1.0/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // cents
        currency: "EUR",
        description,
      }),
    });

    const orderData = await orderRes.json();
    console.log("🧾 Revolut Order:", orderData);

    if (!orderData?.id) {
      throw new Error("Revolut order was not created");
    }

    // 2️⃣ Generate checkout link
    const linkRes = await fetch(
      `https://merchant.revolut.com/api/1.0/orders/${orderData.id}/checkout-link`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const linkData = await linkRes.json();
    console.log("🔗 Payment URL:", linkData);

    if (!linkData?.link) {
      throw new Error("Failed to create checkout link");
    }

    // Return BOTH order id + url
    return res.status(200).json({
      url: linkData.link,
      orderId: orderData.id, // ⬅️ THIS GOES INTO BOOKING
    });

  } catch (err) {
    console.error("💥 create-payment-link error:", err);
    return res.status(500).json({ error: err.message });
  }
}
