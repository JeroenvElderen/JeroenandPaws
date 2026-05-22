import { createClient } from '@supabase/supabase-js';

type GraphEvent = {
  id: string;
  subject?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  categories?: string[];
  isCancelled?: boolean;
  '@removed'?: { reason?: string };
};

type SyncCursorRow = {
  client_id: string;
  delta_link: string | null;
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

async function getAppToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID ?? process.env.AZURE_TENANT_ID;
  const clientId = process.env.OUTLOOK_CLIENT_ID ?? process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.OUTLOOK_CLIENT_SECRET ?? process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing Outlook/Azure OAuth env vars');
  }

  const resp = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    })
  });

  if (!resp.ok) throw new Error(`Token request failed: ${resp.status}`);
  const body = (await resp.json()) as { access_token: string };
  return body.access_token;
}

async function runDeltaSync(clientId: string, calendarId: string, graphUserId: string): Promise<{ imported: number; cancelled: number }> {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const token = await getAppToken();

  const { data: cursor } = await supabase
    .from('outlook_sync_cursors')
    .select('client_id, delta_link')
    .eq('client_id', clientId)
    .maybeSingle();

  let url =
    cursor?.delta_link ||
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(graphUserId)}/calendars/${encodeURIComponent(calendarId)}/events/delta?$select=id,subject,start,end,categories,isCancelled`;

  const collected: GraphEvent[] = [];
  let deltaLink: string | null = null;

  while (url) {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) throw new Error(`Graph delta failed: ${resp.status}`);
    const data = (await resp.json()) as { value?: GraphEvent[]; '@odata.nextLink'?: string; '@odata.deltaLink'?: string };
    collected.push(...(data.value ?? []));
    url = data['@odata.nextLink'] ?? '';
    if (data['@odata.deltaLink']) deltaLink = data['@odata.deltaLink'];
    if (!url) break;
  }

  const deletedEventIds = collected.filter((e) => Boolean(e['@removed'])).map((e) => e.id);
  const upsertRows = collected
    .filter((e) => !e['@removed'])
    .map((event) => {
      const parsed = parseSubject(event.subject ?? '');
      return {
        client_id: clientId,
        outlook_event_id: event.id,
        title: event.subject ?? null,
        service_name: parsed.serviceName,
        dog_names: parsed.dogNames,
        outlook_categories: event.categories ?? [],
        starts_at: event.start?.dateTime,
        ends_at: event.end?.dateTime,
        source: 'outlook',
        status: event.isCancelled ? 'cancelled' : 'confirmed',
        cancelled_at: event.isCancelled ? new Date().toISOString() : null
      };
    })
    .filter((r) => r.starts_at && r.ends_at);

  if (upsertRows.length > 0) {
    const { error } = await supabase.from('bookings').upsert(upsertRows, { onConflict: 'outlook_event_id' });
    if (error) throw new Error(error.message);
  }

  if (deletedEventIds.length > 0) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .in('outlook_event_id', deletedEventIds);
    if (error) throw new Error(error.message);
  }

  if (deltaLink) {
    const row: SyncCursorRow = { client_id: clientId, delta_link: deltaLink };
    const { error } = await supabase.from('outlook_sync_cursors').upsert(row, { onConflict: 'client_id' });
    if (error) throw new Error(error.message);
  }

  return { imported: upsertRows.length, cancelled: deletedEventIds.length };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed' }), { status: 405 });
  }

  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.OUTLOOK_SYNC_SECRET}`) {
    return new Response(JSON.stringify({ ok: false, message: 'Unauthorized' }), { status: 401 });
  }

  const body = (await req.json()) as {
    clientId: string;
    calendarId?: string;
    graphUserId?: string;
  };

  const clientId = body.clientId;
  const calendarId = body.calendarId ?? process.env.OUTLOOK_CALENDAR_ID;
  const graphUserId = body.graphUserId ?? process.env.OUTLOOK_GRAPH_USER_ID ?? process.env.NEXT_PUBLIC_OUTLOOK_CALENDAR_EMAIL;

  if (!clientId || !calendarId || !graphUserId) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Missing clientId and calendar config. Provide calendarId/graphUserId in body or OUTLOOK_CALENDAR_ID/OUTLOOK_GRAPH_USER_ID env vars.'
      }),
      { status: 400 }
    );
  }

  try {
    const result = await runDeltaSync(clientId, calendarId, graphUserId);
    return new Response(JSON.stringify({ ok: true, ...result }), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return new Response(JSON.stringify({ ok: false, message }), { status: 500 });
  }
}