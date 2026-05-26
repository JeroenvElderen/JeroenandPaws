import type { NextApiRequest, NextApiResponse } from 'next';
import { revolutGet } from '../../../../lib/revolut/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { from, to, count } = req.query;
    const { status, data } = await revolutGet('/api/merchant/1.0/transactions', {
      from: typeof from === 'string' ? from : undefined,
      to: typeof to === 'string' ? to : undefined,
      count: typeof count === 'string' ? count : undefined
    });

    return res.status(status).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Revolut merchant transactions failed' });
  }
}
