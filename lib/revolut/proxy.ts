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

export async function revolutMerchantGet(path: string, query?: Record<string, string | number | undefined>) {
  const merchantApiKey = process.env.REVOLUT_MERCHANT_API_KEY;
  if (!merchantApiKey) throw new Error('Missing REVOLUT_MERCHANT_API_KEY');

  const baseUrl = process.env.REVOLUT_MERCHANT_BASE_URL?.trim() || 'https://merchant.revolut.com';
  const apiVersion = process.env.REVOLUT_MERCHANT_API_VERSION?.trim() || '2024-09-01';
  const url = new URL(path, baseUrl);

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
      Authorization: `Bearer ${merchantApiKey}`,
      Accept: 'application/json',
      'Revolut-Api-Version': apiVersion
    }
  });

  const data = await response.json();
  return { status: response.status, data };
}
