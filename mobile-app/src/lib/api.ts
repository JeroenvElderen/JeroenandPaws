import { env } from '@/lib/env';

export async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${env.vercelBackendUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dry-run-external': String(env.apiDryRunExternal),
      'x-dry-run-email-to': env.apiDryRunEmailTo,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API ${path} failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}
