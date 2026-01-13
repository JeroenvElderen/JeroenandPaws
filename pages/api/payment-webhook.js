import { createClient } from "@supabase/supabase-js";
import { getAppOnlyAccessToken } from "../../api/_lib/auth";
import { updateEvent } from "../../api/_lib/graph";

const PAID_BOOKING_CATEGORY =
  process.env.OUTLOOK_PAID_BOOKING_CATEGORY || "Paid booking";

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

    const eventType = event?.event_type;
    const paymentOrderId = event?.data?.id;
    const paymentStatus = event?.data?.state;

    console.log("🧾 Event received:", {
      eventType,
      paymentOrderId,
      paymentStatus,
    });

    if (!paymentOrderId) {
      console.error("❌ Missing order ID");
      return res.status(400).json({ error: "Missing payment order ID" });
    }

    // We only act when payment is completed
    if (eventType !== "ORDER_COMPLETED") {
      console.log("⏭ Ignoring non-completed event:", eventType);
      return res.status(200).json({ ok: true });
    }

    if (paymentStatus !== "COMPLETED") {
      console.log("⏭ Payment not completed yet:", paymentStatus);
      return res.status(200).json({ ok: true });
    }

    console.log("💰 Payment completed! Updating booking…");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, // correct URL var
      process.env.SUPABASE_SERVICE_ROLE_KEY // correct service role var
    );

    const { data, error } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("payment_order_id", paymentOrderId)
      .select(
        "id, calendar_event_id, service_title, start_at, end_at, time_zone, client_address"
      )
      .single();

    if (error || !data) {
      console.error("❌ Booking not found or update failed:", error);
      throw new Error("Booking not found for payment");
    }

    console.log("🎉 Booking marked as PAID:", data.id);

    if (data?.calendar_event_id && process.env.OUTLOOK_CALENDAR_ID) {
      try {
        const accessToken = await getAppOnlyAccessToken();
        await updateEvent({
          accessToken,
          calendarId: process.env.OUTLOOK_CALENDAR_ID,
          eventId: data.calendar_event_id,
          updates: {
            subject: data.service_title || "Booking confirmed",
            body: {
              contentType: "HTML",
              content: `Booking confirmed for ${data.service_title || "Service"}`,
            },
            categories: [PAID_BOOKING_CATEGORY],
            showAs: "busy",
          },
        });
        console.log("📅 Calendar event updated");
      } catch (calendarError) {
        console.error("❌ Calendar update failed", calendarError);
      }
    }
    
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("💥 Webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
}
