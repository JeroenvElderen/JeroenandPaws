import { withApi, resolveUser, requireRole, ApiError } from '@/lib/api';
import { buildWeeklyInvoicePreview } from '@/lib/invoices/previewFromBookings';
import { sendInternalEmail } from '@/lib/email/send';

export default withApi(async (req, res) => {
  if (req.method !== 'POST') throw new ApiError('Method not allowed', 405);
  requireRole(resolveUser(req), 'admin');

  const preview = await buildWeeklyInvoicePreview();
  const body = [
    `Weekly invoicing preview`,
    `Range: ${preview.window.monday} -> ${preview.window.friday}`,
    `Total amount: €${preview.totalAmount.toFixed(2)}`,
    '',
    ...preview.lines.map((line) => `${line.title} | ${line.description} | €${Number(line.price).toFixed(2)}`),
  ].join('\n');

  const mail = await sendInternalEmail('Jeroen & Paws invoicing preview', body);
  res.status(200).json({ ok: true, lines: preview.lines.length, total: preview.totalAmount, mail });
});
