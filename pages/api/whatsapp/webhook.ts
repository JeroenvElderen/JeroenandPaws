import { withApi } from '@/lib/api';
import { config } from '@/lib/config';
import { buildWeeklyInvoicePreview } from '@/lib/invoices/previewFromBookings';
import { sendInternalEmail } from '@/lib/email/send';
import { sendWhatsAppPaymentLink } from '@/lib/whatsapp/client';

function normalizePhone(input: string): string {
  return input.replace(/[^\d+]/g, '');
}

export default withApi(async (req, res) => {
  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'];
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(req.query['hub.challenge']);
      return;
    }
    res.status(403).json({ error: 'verify token mismatch' });
    return;
  }

  if (req.method === 'POST') {
    res.status(200).json({ ok: true });

    const body = req.body ?? {};
    const allowed = normalizePhone(process.env.WHATSAPP_ALLOWED_TRIGGER_PHONE ?? '');
    const from = normalizePhone(String(body?.from ?? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from ?? ''));
    const text = String(body?.text ?? body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ?? '').trim().toLowerCase();

    if (from !== allowed || !['invoice', 'invoicing'].includes(text)) return;

    const preview = await buildWeeklyInvoicePreview();

    if (config.dryRunExternal) {
      const lines = preview.lines
        .map((line) => `Payment title: ${line.title}\nCategory: ${line.category}\nInvoice line: ${line.description}\nPrice: €${Number(line.price).toFixed(2)}`)
        .join('\n\n');
      const message = `WhatsApp trigger: invoice\nRange: ${preview.window.monday} -> ${preview.window.friday}\nTotal: €${preview.totalAmount.toFixed(2)}\n\n${lines}`;
      await sendInternalEmail('Invoicing trigger preview (WhatsApp)', message);
      return;
    }

    for (const line of preview.lines) {
      if (!line.whatsappNumber) continue;
      const textBody = [
        `Jeroen & Paws invoice item`,
        `Title: ${line.title}`,
        `Description: ${line.description}`,
        `Amount: €${Number(line.price).toFixed(2)}`,
      ].join('\n');
      await sendWhatsAppPaymentLink(line.whatsappNumber, textBody);
    }
  }

  res.status(405).json({ error: 'method not allowed' });
});
