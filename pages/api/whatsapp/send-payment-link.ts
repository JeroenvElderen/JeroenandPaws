import { withApi, resolveUser, requireRole, ApiError } from '@/lib/api';
import { sendWhatsAppPaymentLink } from '@/lib/whatsapp/client';

export default withApi(async (req, res) => {
  if (req.method !== 'POST') throw new ApiError('Method not allowed', 405);
  requireRole(resolveUser(req), 'admin');
  const { to, message } = req.body ?? {};
  if (!to || !message) throw new ApiError('to and message required', 422);
  const result = await sendWhatsAppPaymentLink(to, message);
  res.status(200).json({ ok: true, result });
});
