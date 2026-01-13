const { DateTime } = require("luxon");
const { getServiceByIdentifier, supabaseAdmin } = require("./_lib/supabase");

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
        "id, client_id, service_id, service_title, start_at, end_at, time_zone, client_address, notes, resume_token, resume_token_expires_at, services_catalog(slug,title,category)"
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
    const resolvedService =
      primary.services_catalog ||
      (primary.service_id
        ? await getServiceByIdentifier(primary.service_id)
        : null);
    let clientProfile = {};

    if (primary.client_id) {
      const clientResult = await supabaseAdmin
        .from("clients")
        .select("full_name,email,phone_number,address")
        .eq("id", primary.client_id)
        .maybeSingle();

      if (clientResult.error) {
        console.error("Supabase resume-booking client query error:", clientResult.error);
        return res.status(500).json({ message: "Failed to resume booking." });
      }

      clientProfile = clientResult.data || {};
    }

    const bookingIds = data.map((booking) => booking.id).filter(Boolean);
    let pets = [];

    if (bookingIds.length) {
      const bookingPetsResult = await supabaseAdmin
        .from("booking_pets")
        .select("pet_id")
        .in("booking_id", bookingIds);

      if (bookingPetsResult.error) {
        console.error("Supabase resume-booking pets query error:", bookingPetsResult.error);
        return res.status(500).json({ message: "Failed to resume booking." });
      }

      const petIds = Array.from(
        new Set(
          (bookingPetsResult.data || [])
            .map((row) => row.pet_id)
            .filter(Boolean)
        )
      );

      if (petIds.length) {
        const petsResult = await supabaseAdmin
          .from("pets")
          .select("id,name,breed,notes,photo_data_url")
          .in("id", petIds);

        if (petsResult.error) {
          console.error("Supabase resume-booking pet details error:", petsResult.error);
          return res.status(500).json({ message: "Failed to resume booking." });
        }

        pets = petsResult.data || [];
      }
    }

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
        id: resolvedService?.slug || primary.service_id,
        title: primary.service_title || resolvedService?.title,
        slug: resolvedService?.slug || null,
        category: resolvedService?.category || null,
      },
      client: {
        name: clientProfile.full_name || "",
        email: clientProfile.email || "",
        phone: clientProfile.phone_number || "",
        address: primary.client_address || clientProfile.address || "",
      },
      notes: primary.notes,
      pets,
      additionals: [],
      recurrence: "none",
      schedule,
    });
  } catch (error) {
    console.error("Resume booking error:", error);
    return res.status(500).json({ message: "Failed to resume booking." });
  }
};