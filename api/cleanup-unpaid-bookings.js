const { DateTime } = require("luxon");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { deleteEvent } = require("./_lib/graph");
const { supabaseAdmin } = require("./_lib/supabase");

const matchesAuth = (req) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const bearer = req.headers.authorization || "";
  if (bearer === `Bearer ${secret}`) return true;
  if (req.query?.token === secret) return true;
  return false;
};

module.exports = async (req, res) => {
  if (req.method !== "POST" && req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, POST");
    res.end("Method Not Allowed");
    return;
  }

  if (!matchesAuth(req)) {
    res.statusCode = 401;
    res.end("Unauthorized");
    return;
  }

  try {
    const cutoff = DateTime.now().toUTC().minus({ hours: 24 }).toISO();
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("id, calendar_event_id")
      .in("status", ["pending", "cancelled", "canceled"])
      .lt("created_at", cutoff)
      .or("payment_status.is.null,payment_status.neq.paid");

    if (error) throw error;

    res.setHeader("Content-Type", "application/json");

    if (!data || data.length === 0) {
      res.statusCode = 200;
      res.end(JSON.stringify({ deleted: 0 }));
      return;
    }

    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    const accessToken = calendarId ? await getAppOnlyAccessToken() : null;
    const deletableIds = [];
    const failures = [];

    for (const booking of data) {
      if (booking.calendar_event_id && accessToken && calendarId) {
        try {
          await deleteEvent({
            accessToken,
            calendarId,
            eventId: booking.calendar_event_id,
          });
        } catch (deleteError) {
          failures.push({
            id: booking.id,
            error: deleteError.message,
          });
          continue;
        }
      }

      deletableIds.push(booking.id);
    }

    if (deletableIds.length) {
      const deleteResult = await supabaseAdmin
        .from("bookings")
        .delete()
        .in("id", deletableIds);

      if (deleteResult.error) {
        throw deleteResult.error;
      }
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        deleted: deletableIds.length,
        skipped: failures.length,
        failures,
      })
    );
  } catch (error) {
    console.error("Cleanup unpaid bookings failed", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Cleanup failed." }));
  }
};