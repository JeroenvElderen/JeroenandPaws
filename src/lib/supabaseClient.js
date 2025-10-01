const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const buildOrderParam = (order) => {
  if (!order || !order.column) {
    return null;
  }

  const direction = order.ascending === false ? 'desc' : 'asc';
  return `${order.column}.${direction}`;
};

export const fetchSupabaseTable = async (tableName, options = {}) => {
  if (!tableName) {
    throw new Error('A table name is required to query Supabase.');
  }

  if (!isSupabaseConfigured) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const { select = '*', order, signal } = options;
  const url = new URL(`${supabaseUrl}/rest/v1/${tableName}`);
  url.searchParams.set('select', select);

  const orderParam = buildOrderParam(order);
  if (orderParam) {
    url.searchParams.append('order', orderParam);
  }

  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase request for "${tableName}" failed with status ${response.status}: ${errorText || response.statusText}`,
    );
  }

  return response.json();
};