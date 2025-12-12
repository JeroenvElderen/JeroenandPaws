import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false, // Revolut sends raw body
  },
};

async function getRawBody(req) {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  return Buffer.concat(buffers).toString("utf8");
}

export default async function handler(req, res) {
  console.log(">>> HIT Revolut Payment Webhook");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await getRawBody(req);
    console.log("📩 Raw Event:", rawBody);

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      console.error("❌ Invalid JSON");
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const rawEventType = event?.event_type || "";
    const eventType = rawEventType.toUpperCase();
    const paymentOrderId = event?.data?.id;
    const paymentStatus = (event?.data?.state || "").toUpperCase();

    console.log("🧾 Event received:", {
      eventType: rawEventType,
      paymentOrderId,
      paymentStatus,
    });

    if (!paymentOrderId) {
      console.error("❌ Missing order ID");
      return res.status(400).json({ error: "Missing payment order ID" });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, // correct URL var
      process.env.SUPABASE_SERVICE_ROLE_KEY // correct service role var
    );

    const cancelledStates = new Set([
      "CANCELLED",
      "CANCELED",
      "FAILED",
      "DECLINED",
      "VOIDED",
      "EXPIRED",
      "REVERSED",
      "REVOKED",
    ]);

    const cancelledEvents = new Set([
      "ORDER_CANCELLED",
      "ORDER_CANCELED",
      "ORDER_FAILED",
      "ORDER_EXPIRED",
    ]);

    // Delete unpaid bookings if Revolut reports a cancellation/failed state
    if (cancelledStates.has(paymentStatus) || cancelledEvents.has(eventType)) {
      console.log("🗑 Payment not completed. Removing unpaid bookings.");

      const { data: deletedRows, error: deleteError } = await supabase
        .from("bookings")
        .delete()
        .eq("payment_order_id", paymentOrderId)
        .neq("payment_status", "paid")
        .select("id");

      if (deleteError) {
        console.error("❌ Failed to delete unpaid booking:", deleteError);
        throw new Error("Failed to delete unpaid booking");
      }

      console.log(
        "🧹 Deleted unpaid bookings:",
        deletedRows?.map((row) => row.id) || []
      );

      return res.status(200).json({ ok: true });
    }

    // Only mark as paid when the order is completed
    if (eventType !== "ORDER_COMPLETED") {
      console.log("⏭ Ignoring non-completed event:", eventType);
      return res.status(200).json({ ok: true });
    }

    if (paymentStatus !== "COMPLETED") {
      console.log("⏭ Payment not completed yet:", paymentStatus);
      return res.status(200).json({ ok: true });
    }

    console.log("💰 Payment completed! Updating booking…");

    const { data, error } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("payment_order_id", paymentOrderId)
      .select("id")
      .single();

    if (error || !data) {
      console.error("❌ Booking not found or update failed:", error);
      throw new Error("Booking not found for payment");
    }

    console.log("🎉 Booking marked as PAID:", data.id);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("💥 Webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
}
