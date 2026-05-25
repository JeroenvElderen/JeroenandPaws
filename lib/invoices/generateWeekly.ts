import { supabaseAdmin } from '@/lib/supabase/server';

export async function generateWeeklyInvoices() {
  const now = new Date();
  const day = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);
  friday.setUTCHours(23, 59, 59, 999);

  const { data } = await supabaseAdmin
    .from('bookings')
    .select('id, client_id, dog_id, service_type, duration, booking_date, dogs(dog_name), client_prices(price)')
    .gte('booking_date', monday.toISOString())
    .lte('booking_date', friday.toISOString())
    .eq('status', 'confirmed');

  return { count: data?.length ?? 0, window: { monday: monday.toISOString(), friday: friday.toISOString() } };
}
