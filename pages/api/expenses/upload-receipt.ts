import { withApi, resolveUser, requireRole, ApiError } from '@/lib/api';

export default withApi(async (req, res) => {
  const user = resolveUser(req);
  if (req.url?.includes('/api/admin/') || req.url?.includes('/api/dashboard/')) {
    requireRole(user, 'admin');
  }
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {
    throw new ApiError('Method not allowed', 405);
  }
  res.status(200).json({ ok: true, route: req.url, method: req.method, user });
});
