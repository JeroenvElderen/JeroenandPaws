import crypto from "crypto";
import fs from "fs";
import path from "path";
import { DateTime } from "luxon";

// Correct shared lib imports
import { supabase } from "./_lib/supabase";
import { getAppOnlyAccessToken } from "./_lib/auth";
import { createEvent, sendMail, updateEvent } from "./_lib/graph";
import { saveBookingCalendarEventId } from "./_lib/supabase";
import {
  buildConfirmationBody,
  buildNotificationBody,
  buildConfirmationSubject,
} from "./_lib/confirmation-email";
import {
  buildCalendarBody,
  buildCalendarSubject,
  buildCalendarCategories,
  resolveCalendarLocationDisplayName,
} from "./_lib/calendar-events";

// Invoice + OneDrive
import { generateInvoiceNumber } from "./_lib/invoices";
import { createInvoicePdf } from "./_lib/invoicePdf";
import { uploadToOneDrive } from "./_lib/onedrive";

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const rawBody = await readRawBody(req);

  // 🔐 Validate signature
  const signature = req.headers["revolut-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.REVOLUT_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    console.error("❌ Invalid webhook signature");
    return res.status(401).end("Invalid signature");
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).end("Bad JSON");
  }

  if ((event.event_type || event.type) !== "ORDER_COMPLETED") {
    return res.status(200).end("Ignored");
  }

  const paymentOrderId = event.data?.id;
  if (!paymentOrderId) return res.status(400).end("Missing payment id");

  // 🎯 Lookup booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("payment_order_id", paymentOrderId)
    .single();

  if (!booking) return res.status(404).end("Booking not found");

  // 🟢 Mark paid
  await supabase
    .from("bookings")
    .update({ payment_status: "paid", status: "confirmed" })
    .eq("id", booking.id);

  console.log("💰 Booking marked as paid");

  // ======================================
  // 🧾 GENERATE & STORE INVOICE
  // ======================================

  try {
    const invoiceNumber = await generateInvoiceNumber();
    const savePath = path.join("/tmp", `${invoiceNumber}.pdf`);

    await createInvoicePdf({
      booking,
      invoiceNumber,
      savePath,
    });

    const oneDrivePath = await uploadToOneDrive(savePath, invoiceNumber);

    await supabase
      .from("bookings")
      .update({
        invoice_number: invoiceNumber,
        invoice_onedrive_path: oneDrivePath,
      })
      .eq("id", booking.id);

    fs.unlinkSync(savePath); // cleanup

    console.log("🧾 Invoice stored:", oneDrivePath);
  } catch (err) {
    console.error("❌ Invoice creation failed", err);
  }

  // ======================================
  // 📅 CALENDAR EVENT
  // ======================================

  try {
    const accessToken = await getAppOnlyAccessToken();
    const start = DateTime.fromISO(booking.start_at).toUTC().toISO();
    const end = DateTime.fromISO(booking.end_at).toUTC().toISO();

    if (booking.calendar_event_id) {
      const locationDisplayName = resolveCalendarLocationDisplayName({
        clientAddress: booking.client_address,
      });
      await updateEvent({
        accessToken,
        calendarId: process.env.OUTLOOK_CALENDAR_ID,
        eventId: booking.calendar_event_id,
        updates: {
          subject: buildCalendarSubject({
            serviceTitle: booking.service_title,
            status: "confirmed",
          }),
          body: {
            contentType: "Text",
            content: buildCalendarBody({
              serviceTitle: booking.service_title,
              status: "confirmed",
              clientName: booking.client_name,
              clientPhone: booking.client_phone,
              clientEmail: booking.client_email,
              clientAddress: booking.client_address,
              notes: booking.notes,
              pets: booking.pets,
              schedule: booking.schedule,
              additionals: booking.additionals,
            }),
          },
          categories: buildCalendarCategories({
            status: "confirmed",
            serviceTitle: booking.service_title,
          }),
          ...(locationDisplayName
            ? { location: { displayName: locationDisplayName } }
            : {}),
          showAs: "busy",
        },
      });
      console.log("📅 Calendar event updated");
    } else {
      const locationDisplayName = resolveCalendarLocationDisplayName({
        clientAddress: booking.client_address,
      });
      const calendarEvent = await createEvent({
        accessToken,
        calendarId: process.env.OUTLOOK_CALENDAR_ID,
        subject: buildCalendarSubject({
          serviceTitle: booking.service_title,
          status: "confirmed",
        }),
        start,
        end,
        timeZone: booking.time_zone || "UTC",
        locationDisplayName,
        body: buildCalendarBody({
          serviceTitle: booking.service_title,
          status: "confirmed",
          clientName: booking.client_name,
          clientPhone: booking.client_phone,
          clientEmail: booking.client_email,
          clientAddress: booking.client_address,
          notes: booking.notes,
          pets: booking.pets,
          schedule: booking.schedule,
          additionals: booking.additionals,
        }),
        bodyContentType: "Text",
        categories: buildCalendarCategories({
          status: "confirmed",
          serviceTitle: booking.service_title,
        }),
        showAs: "busy",
      });

      if (calendarEvent?.id)
        await saveBookingCalendarEventId(booking.id, calendarEvent.id);

      console.log("📅 Calendar event created");
    }
  } catch (err) {
    console.error("❌ Calendar creation failed", err);
  }

  // ======================================
  // 📧 EMAILS (NO INVOICE ATTACHMENT)
  // ======================================

  const timing = {
    start: DateTime.fromISO(booking.start_at)
      .setZone(booking.time_zone)
      .toFormat("cccc, LLLL d, yyyy 'at' t ZZZZ"),
    end: DateTime.fromISO(booking.end_at)
      .setZone(booking.time_zone)
      .toFormat("cccc, LLLL d, yyyy 'at' t ZZZZ"),
    timeZone: booking.time_zone,
  };

  const confirmationBody = buildConfirmationBody({
    clientName: booking.client_name,
    timing,
    service: { title: booking.service_title },
    notes: booking.notes,
    pets: booking.pets,
    clientAddress: booking.client_address,
    schedule: booking.schedule || [],
    recurrence: booking.recurrence,
    additionals: booking.additionals || [],
  });

  try {
    const accessToken = await getAppOnlyAccessToken();
    await sendMail({
      accessToken,
      fromCalendarId: process.env.OUTLOOK_CALENDAR_ID,
      to: booking.client_email,
      subject: buildConfirmationSubject({
        pets: booking.pets,
        service: { title: booking.service_title },
      }),
      body: confirmationBody,
      contentType: "HTML",
    });
    console.log("📨 Confirmation email sent");
  } catch (err) {
    console.error("❌ Confirmation email failed", err);
  }

  return res.status(200).end("OK");
}
