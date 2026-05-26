import { getFreshRevolutAccessToken } from './businessAuth';

export async function revolutGet(path: string, query?: Record<string, string | number | undefined>) {
  const accessToken = await getFreshRevolutAccessToken();
  const url = new URL(path, 'https://b2b.revolut.com');

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim().length > 0) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  const data = await response.json();
  return { status: response.status, data };
}
