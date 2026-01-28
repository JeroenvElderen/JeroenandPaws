const { DateTime } = require("luxon");
const { getAppOnlyAccessToken } = require("./_lib/auth");
const { deleteEvent, sendMail } = require("./_lib/graph");
const {
  buildPaymentLinkBody,
  buildPaymentLinkSubject,
} = require("./_lib/confirmation-email");
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
    const now = DateTime.now().toUTC();
    const resendCutoff = now.minus({ hours: 24 }).toISO();
    const cancelCutoff = now.minus({ hours: 48 }).toISO();

    res.setHeader("Content-Type", "application/json");

    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    const accessToken = calendarId ? await getAppOnlyAccessToken() : null;
    
    const { data: resendCandidates, error: resendError } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, client_email, client_name, service_title, payment_link, payment_link_last_sent_at"
      )
      .eq("status", "pending")
      .lt("created_at", resendCutoff)
      .or("payment_status.is.null,payment_status.neq.paid")
      .is("payment_link_last_sent_at", null)
      .not("payment_link", "is", null);

    if (resendError) throw resendError;

    const resendFailures = [];
    const resentIds = [];

    if (resendCandidates?.length && calendarId && accessToken) {
      for (const booking of resendCandidates) {
        if (!booking.client_email || !booking.payment_link) {
          resendFailures.push({
            id: booking.id,
            error: "Missing client email or payment link",
          });
          continue;
        }

      try {
          await sendMail({
            accessToken,
            fromCalendarId: calendarId,
            to: booking.client_email,
            subject: buildPaymentLinkSubject({
              serviceTitle: booking.service_title,
            }),
            body: buildPaymentLinkBody({
              clientName: booking.client_name,
              serviceTitle: booking.service_title,
              paymentLink: booking.payment_link,
            }),
            contentType: "HTML",
          });
          resentIds.push(booking.id);
        } catch (sendError) {
          resendFailures.push({ id: booking.id, error: sendError.message });
        }
      }
    } else if (resendCandidates?.length) {
      resendFailures.push({
        error: "Missing Outlook calendar access for resend",
      });
    }

    if (resentIds.length) {
      const resendUpdate = await supabaseAdmin
        .from("bookings")
        .update({ payment_link_last_sent_at: now.toISO() })
        .in("id", resentIds);

      if (resendUpdate.error) throw resendUpdate.error;
    }

    const { data: cancelCandidates, error: cancelError } = await supabaseAdmin
      .from("bookings")
      .select("id, calendar_event_id")
      .eq("status", "pending")
      .lt("created_at", cancelCutoff)
      .or("payment_status.is.null,payment_status.neq.paid");

    if (cancelError) throw cancelError;

    const cancelFailures = [];
    const cancellableIds = [];

    if (cancelCandidates?.length) {
      for (const booking of cancelCandidates) {
        if (booking.calendar_event_id && accessToken && calendarId) {
          try {
            await deleteEvent({
              accessToken,
              calendarId,
              eventId: booking.calendar_event_id,
            });
          } catch (deleteError) {
            cancelFailures.push({
              id: booking.id,
              error: deleteError.message,
            });
            continue;
          }
        }

        cancellableIds.push(booking.id);
      }
    }

    if (cancellableIds.length) {
      const cancelDelete = await supabaseAdmin
        .from("bookings")
        .delete()
        .in("id", cancellableIds);

      if (cancelDelete.error) {
        throw cancelDelete.error;
      }
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        resent: resentIds.length,
        resendFailures,
        deleted: cancellableIds.length,
        cancelFailures,
      })
    );
  } catch (error) {
    console.error("Cleanup unpaid bookings failed", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Cleanup failed." }));
  }
};