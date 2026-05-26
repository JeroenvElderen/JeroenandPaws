import type { NextApiRequest, NextApiResponse } from 'next';
import { revolutGet } from '../../../../lib/revolut/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status, data } = await revolutGet('/api/merchant/1.0/accounts');
    return res.status(status).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Revolut merchant accounts failed' });
  }
}
