const { DateTime } = require("luxon");
const { supabaseAdmin } = require("./_lib/supabase");

const normalizeResumeToken = (value) => {
  const cleaned = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!cleaned) return "";
  return cleaned.match(/.{1,4}/g).join("-");
};

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    // Next.js parses JSON body automatically when Content-Type is application/json
    const body = req.body || {};
    const token = normalizeResumeToken(body.token || body.resumeToken || body.resume_token);

    if (!token) {
      return res.status(400).json({ message: "Missing resume token." });
    }

    const nowIso = DateTime.now().toUTC().toISO();

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, service_id, service_title, start_at, end_at, time_zone, client_name, client_email, client_phone, client_address, notes, additionals, recurrence, resume_token, resume_token_expires_at, services_catalog(slug,title)"
      )
      .eq("resume_token", token)
      .gt("resume_token_expires_at", nowIso)
      .or("payment_status.is.null,payment_status.neq.paid")
      .order("start_at", { ascending: true });

    if (error) {
      // Surface Supabase error for logs, but keep client response clean
      console.error("Supabase resume-booking query error:", error);
      return res.status(500).json({ message: "Failed to resume booking." });
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "Resume token not found or expired." });
    }

    const primary = data[0];

    const schedule = data.map((booking) => {
      const zone = booking.time_zone || "UTC";
      const start = DateTime.fromISO(booking.start_at, { zone });
      const end = DateTime.fromISO(booking.end_at, { zone });

      const durationMinutes = Math.max(
        0,
        Math.round(end.diff(start, "minutes").minutes)
      );

      return {
        date: start.toISODate(),
        time: start.toFormat("HH:mm"),
        durationMinutes,
      };
    });

    return res.status(200).json({
      resumeToken: primary.resume_token,
      resumeTokenExpiresAt: primary.resume_token_expires_at,
      service: {
        // keep your current behavior: id is slug when available, otherwise service_id
        id: primary.services_catalog?.slug || primary.service_id,
        title: primary.service_title,
        slug: primary.services_catalog?.slug || null,
      },
      client: {
        name: primary.client_name,
        email: primary.client_email,
        phone: primary.client_phone,
        address: primary.client_address,
      },
      notes: primary.notes,
      additionals: primary.additionals || [],
      recurrence: primary.recurrence || "none",
      schedule,
    });
  } catch (error) {
    console.error("Resume booking error:", error);
    return res.status(500).json({ message: "Failed to resume booking." });
  }
};