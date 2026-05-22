import { withApi, resolveUser, requireRole, ApiError } from '@/lib/api';
import { generateWeeklyInvoices } from '@/lib/invoices/generateWeekly';

export default withApi(async (req, res) => {
  if (req.method !== 'POST') throw new ApiError('Method not allowed', 405);
  const user = resolveUser(req);
  requireRole(user, 'admin');
  const result = await generateWeeklyInvoices();
  res.status(200).json({ ok: true, ...result });
});
