import { createClient } from '@supabase/supabase-js';

type IncomingEvent = {
  id: string;
  subject: string;
  start: { dateTime: string };
  end: { dateTime: string };
  categories?: string[];
  isCancelled?: boolean;
};

const SERVICE_KEYWORDS = ['walk', 'training', 'boarding', 'daycare', 'home check-in', 'group'];

function parseSubject(subject: string): { serviceName: string; dogNames: string[] } {
  const normalized = subject.trim();
  const parts = normalized.split('-').map((x) => x.trim()).filter(Boolean);
  let serviceName = 'unknown';
  let dogsPart = normalized;

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (SERVICE_KEYWORDS.some((kw) => lower.includes(kw))) {
      serviceName = part;
      dogsPart = parts.filter((p) => p !== part).join(' ');
      break;
    }
  }

  if (serviceName === 'unknown') {
    const lower = normalized.toLowerCase();
    const found = SERVICE_KEYWORDS.find((kw) => lower.includes(kw));
    if (found) serviceName = found;
  }

  const dogNames = dogsPart
    .split('&')
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((name) => !SERVICE_KEYWORDS.some((kw) => name.toLowerCase().includes(kw)));

  return { serviceName, dogNames };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed' }), { status: 405 });
  }

  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.OUTLOOK_SYNC_SECRET}`) {
    return new Response(JSON.stringify({ ok: false, message: 'Unauthorized' }), { status: 401 });
  }

  const { clientId, events, deletedEventIds } = (await req.json()) as {
    clientId: string;
    events: IncomingEvent[];
    deletedEventIds?: string[];
  };
  if (!clientId || !Array.isArray(events)) {
    return new Response(JSON.stringify({ ok: false, message: 'Missing clientId or events array' }), { status: 400 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const rows = events.map((event) => {
    const parsed = parseSubject(event.subject ?? '');
    return {
      client_id: clientId,
      outlook_event_id: event.id,
      title: event.subject,
      service_name: parsed.serviceName,
      dog_names: parsed.dogNames,
      outlook_categories: event.categories ?? [],
      starts_at: event.start?.dateTime,
      ends_at: event.end?.dateTime,
      source: 'outlook',
      status: event.isCancelled ? 'cancelled' : 'confirmed',
      cancelled_at: event.isCancelled ? new Date().toISOString() : null
    };
  });

  const { error } = await supabase.from('bookings').upsert(rows, { onConflict: 'outlook_event_id' });
  if (error) {
    return new Response(JSON.stringify({ ok: false, message: error.message }), { status: 500 });
  }

  if (Array.isArray(deletedEventIds) && deletedEventIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .in('outlook_event_id', deletedEventIds);

    if (deleteError) {
      return new Response(JSON.stringify({ ok: false, message: deleteError.message }), { status: 500 });
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      imported: rows.length,
      cancelledFromDeletion: Array.isArray(deletedEventIds) ? deletedEventIds.length : 0
    }),
    { status: 200 }
  );
}