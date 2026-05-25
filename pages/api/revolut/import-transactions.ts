import { withApi, resolveUser, requireRole, ApiError } from '@/lib/api';

export default withApi(async (req, res) => {
  if (req.method !== 'POST') throw new ApiError('Method not allowed', 405);
  requireRole(resolveUser(req), 'admin');
  res.status(200).json({ ok: true, imported: 0, ownerDrawDetected: 0, expensesDetected: 0 });
});
