import { withApi, ApiError } from '@/lib/api';

export default withApi(async (req, res) => {
  if (req.method !== 'POST') throw new ApiError('Method not allowed', 405);
  const signature = req.headers['x-signature'];
  if (process.env.REVOLUT_WEBHOOK_SECRET && !signature) throw new ApiError('Missing signature', 401);
  // TODO: verify signature + idempotency key storage.
  res.status(200).json({ ok: true });
});
