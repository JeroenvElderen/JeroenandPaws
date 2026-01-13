const { DateTime } = require("luxon");
const { supabaseAdmin } = require("./_lib/supabase");

const normalizeResumeToken = (value) => {
  const cleaned = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (!cleaned) return "";
  return cleaned.match(/.{1,4}/g).join("-");
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  try {
    res.setHeader("Content-Type", "application/json");
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    const parsed = body ? JSON.parse(body) : {};
    const token = normalizeResumeToken(parsed.token || parsed.resumeToken);

    if (!token) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Missing resume token." }));
      return;
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
      throw error;
    }

    if (!data || data.length === 0) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Resume token not found or expired." }));
      return;
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

    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        resumeToken: primary.resume_token,
        resumeTokenExpiresAt: primary.resume_token_expires_at,
        service: {
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
      })
    );
  } catch (error) {
    console.error("Resume booking error", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: "Failed to resume booking." }));
  }
};