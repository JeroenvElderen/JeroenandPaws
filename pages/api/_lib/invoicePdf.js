import PDFDocument from "pdfkit";
import { DateTime } from "luxon";
import fs from "fs";

export async function createInvoicePdf({ booking, invoiceNumber, savePath }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(savePath);
    doc.pipe(stream);

    // Header
    doc
      .image('./public/jpaws-logo.png', 50, 45, { width: 90 })
      .fontSize(20)
      .text('Jeroen & Paws', 150, 50)
      .fontSize(10)
      .text('9 Rosslyn Grove, A98H940, Bray', 150, 75)
      .text('Phone: 087 247 3099', 150, 90)
      .text('Email: jeroen@jeroenandpaws.com', 150, 105);

    doc.moveDown();
    doc.fontSize(18).text('INVOICE', { align: 'right' });
    doc.fontSize(12).text(`Invoice No: ${invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${DateTime.now().toFormat("dd LLL yyyy")}`, { align: 'right' });

    // Client
    doc.moveDown().moveDown();
    doc.fontSize(12).text(`BILL TO:`);
    doc.fontSize(14).text(booking.client_name);
    doc.fontSize(12).text(booking.client_email);
    doc.text(booking.client_address);

    doc.moveDown();
    doc.text(`Service: ${booking.service_title}`);
    doc.text(
      `Date: ${DateTime.fromISO(booking.start_at)
        .setZone(booking.time_zone || "UTC")
        .toFormat("cccc, dd LLL yyyy 'at' t")}`
    );

    doc.moveDown();
    doc.fontSize(16).text(`Amount Paid: €${booking.amount}`, { align: "right" });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
