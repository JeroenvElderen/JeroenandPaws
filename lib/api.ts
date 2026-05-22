import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type SessionUser = { id: string; role: 'admin' | 'client'; clientId: string | null };

export function resolveUser(req: NextApiRequest): SessionUser {
  const role = req.headers['x-role'];
  const userId = req.headers['x-user-id'];
  const clientId = req.headers['x-client-id'];

  if (typeof role !== 'string' || typeof userId !== 'string') {
    throw new ApiError('Missing auth headers', 401);
  }

  if (role !== 'admin' && role !== 'client') {
    throw new ApiError('Invalid role', 403);
  }

  return { id: userId, role, clientId: typeof clientId === 'string' ? clientId : null };
}

export function requireRole(user: SessionUser, role: 'admin' | 'client'): void {
  if (user.role !== role) {
    throw new ApiError('Forbidden', 403);
  }
}

export function withApi(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>): NextApiHandler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error('api_error', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
