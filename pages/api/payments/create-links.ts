import { withApi, resolveUser, requireRole, ApiError } from '@/lib/api';
import { createHostedCheckout } from '@/lib/revolut/merchant';

export default withApi(async (req, res) => {
  if (req.method !== 'POST') throw new ApiError('Method not allowed', 405);
  requireRole(resolveUser(req), 'admin');
  const invoiceId = req.body?.invoiceId as string;
  if (!invoiceId) throw new ApiError('invoiceId required', 422);
  const link = await createHostedCheckout(invoiceId);
  res.status(200).json({ ok: true, link });
});
