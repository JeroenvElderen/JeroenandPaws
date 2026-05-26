import type { NextApiRequest, NextApiResponse } from 'next';
import { revolutMerchantGet } from '../../../../lib/revolut/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { from, to, count, limit } = req.query;
    const maxItems = typeof limit === 'string' ? limit : typeof count === 'string' ? count : '50';

    const { status, data } = await revolutMerchantGet('/api/orders', {
      from_created_at: typeof from === 'string' ? from : undefined,
      to_created_at: typeof to === 'string' ? to : undefined,
      limit: maxItems
    });

    return res.status(status).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Revolut merchant transactions failed' });
  }
}
