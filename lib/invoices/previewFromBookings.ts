import { supabaseAdmin } from '@/lib/supabase/server';
import { fetchWeeklyOutlookEvents, parseServiceFromEvent } from '@/lib/outlook/calendar';

type PriceRow = { client_id: string; dog_id: string | null; service_type: string; duration: string; price: number };
type ClientRow = { id: string; email: string | null; full_name: string | null };

function normalizeDuration(duration: string): string {
  const d = duration.toLowerCase();
  if (d.includes('60')) return '60min';
  if (d.includes('30')) return '30min';
  if (d.includes('full')) return 'Full day';
  return duration;
}

export async function buildWeeklyInvoicePreview() {
  const outlook = await fetchWeeklyOutlookEvents();
  const emailHints = [...new Set(outlook.events.map((e) => parseServiceFromEvent(e).emailHint).filter(Boolean) as string[])];

  const { data: clients } = await supabaseAdmin.from('clients').select('id, email, full_name').in('email', emailHints.length ? emailHints : ['']);
  const clientRows = (clients ?? []) as ClientRow[];
  const clientIds = clientRows.map((c) => c.id);

  const { data: prices } = await supabaseAdmin
    .from('client_prices')
    .select('client_id, dog_id, service_type, duration, price')
    .in('client_id', clientIds.length ? clientIds : ['']);

  const priceRows = (prices ?? []) as PriceRow[];

  const lines = outlook.events.map((event) => {
    const parsed = parseServiceFromEvent(event);
    const client = clientRows.find((c) => c.email && parsed.emailHint && c.email.toLowerCase() === parsed.emailHint.toLowerCase());
    const duration = normalizeDuration(parsed.duration);
    const base30 = client
      ? priceRows.find((p) => p.client_id === client.id && p.service_type === parsed.service && normalizeDuration(p.duration) === '30min')?.price ?? 0
      : 0;
    const exact = client
      ? priceRows.find((p) => p.client_id === client.id && p.service_type === parsed.service && normalizeDuration(p.duration) === duration)?.price
      : undefined;
    const extraHour = duration === '60min' ? 10 : 0;
    const price = typeof exact === 'number' ? exact : base30 + extraHour;

    return {
      eventId: event.id,
      clientId: client?.id ?? null,
      title: `${parsed.dogName} - ${parsed.service} - ${duration} - 1 day`,
      description: `${parsed.service} - ${parsed.dogName}`,
      duration,
      category: parsed.category,
      price,
    };
  });

  return {
    window: outlook.window,
    source: 'outlook_calendar',
    totalAmount: lines.reduce((acc, line) => acc + Number(line.price || 0), 0),
    lines,
  };
}
