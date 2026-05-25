import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type GraphEvent = {
  id: string;
  subject?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  categories?: string[];
  isCancelled?: boolean;
  '@removed'?: { reason?: string };
};

type ClientRow = {
  id: string;
  full_name: string;
};

type DogRow = {
  client_id: string;
  name: string;
};

type ResolvedClient = {
  clientId: string;
  dogNames: string[];
  serviceName: string;
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

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseClientAndDogsFromSubject(subject: string): { firstName: string | null; dogNames: string[]; serviceName: string } {
  const [left = '', ...rest] = subject.split('-').map((x) => x.trim()).filter(Boolean);
  const parsed = parseSubject(subject);
  const firstName = left ? normalizeName(left.split(/\s+/)[0] ?? '') : null;
  const dogsFromRight = rest.join(' - ');
  const dogNames = (dogsFromRight ? dogsFromRight.split(/[,&]/) : parsed.dogNames)
    .map((name) => normalizeName(name))
    .filter(Boolean)
    .filter((name) => !SERVICE_KEYWORDS.some((kw) => name.includes(kw)));
  return { firstName: firstName || null, dogNames, serviceName: parsed.serviceName };
}

async function resolveClientByNames(
  supabase: SupabaseClient,
  subject: string
): Promise<ResolvedClient | null> {
  const { firstName, dogNames, serviceName } = parseClientAndDogsFromSubject(subject);
  if (!firstName || dogNames.length === 0) return null;

  const { data: clients, error } = await supabase.from('clients').select('id, full_name');
  if (error) throw new Error(`Failed loading clients: ${error.message}`);

  const matchingClients = ((clients ?? []) as ClientRow[]).filter((client) => {
    const first = normalizeName(String(client.full_name ?? '').split(/\s+/)[0] ?? '');
    return first === firstName;
  });

  if (matchingClients.length === 0) return null;

  const candidateIds = matchingClients.map((client: ClientRow) => client.id);
  const { data: dogs, error: dogsError } = await supabase
    .from('dogs')
    .select('client_id, name')
    .in('client_id', candidateIds);
  if (dogsError) throw new Error(`Failed loading dogs: ${dogsError.message}`);

  const dogSet = new Set(dogNames);
  const matches = candidateIds.filter((candidateId) => {
    const ownedDogs = ((dogs ?? []) as DogRow[])
      .filter((dog) => dog.client_id === candidateId)
      .map((dog) => normalizeName(String(dog.name ?? '')));
    return dogNames.every((name) => ownedDogs.includes(name)) && ownedDogs.some((name) => dogSet.has(name));
  });

  if (matches.length !== 1) return null;
  return { clientId: matches[0], dogNames, serviceName };
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

async function runDeltaSync(clientId: string | null, calendarId: string, graphUserId: string): Promise<{ imported: number; cancelled: number }> {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const token = await getAppToken();

  const { data: cursor } = await supabase
    .from('outlook_sync_cursors')
    .select('client_id, delta_link')
    .eq('client_id', clientId ?? '__unresolved__')
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

  const resolvedRows: typeof upsertRows = [];
  for (const row of upsertRows) {
    if (row.client_id) {
      resolvedRows.push(row);
      continue;
    }
    const resolved = await resolveClientByNames(supabase, row.title ?? '');
    if (!resolved) continue;
    resolvedRows.push({
      ...row,
      client_id: resolved.clientId,
      dog_names: resolved.dogNames,
      service_name: row.service_name === 'unknown' ? resolved.serviceName : row.service_name
    });
  }

  if (resolvedRows.length > 0) {
    const { error } = await supabase.from('bookings').upsert(resolvedRows, { onConflict: 'outlook_event_id' });
    if (error) throw new Error(error.message);
  }

  if (deletedEventIds.length > 0) {
    const cancellationQuery = supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .in('outlook_event_id', deletedEventIds);
    const { error } = clientId ? await cancellationQuery.eq('client_id', clientId) : await cancellationQuery;
    if (error) throw new Error(error.message);
  }

  if (deltaLink && clientId) {
    const row: SyncCursorRow = { client_id: clientId, delta_link: deltaLink };
    const { error } = await supabase.from('outlook_sync_cursors').upsert(row, { onConflict: 'client_id' });
    if (error) throw new Error(error.message);
  }

  return { imported: resolvedRows.length, cancelled: deletedEventIds.length };
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
    clientId?: string;
    calendarId?: string;
    graphUserId?: string;
  };

  const clientId = body.clientId ?? null;
  const calendarId = body.calendarId ?? process.env.OUTLOOK_CALENDAR_ID;
  const graphUserId = body.graphUserId ?? process.env.OUTLOOK_GRAPH_USER_ID ?? process.env.NEXT_PUBLIC_OUTLOOK_CALENDAR_EMAIL;

  if (!calendarId || !graphUserId) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Missing calendar config. Provide calendarId/graphUserId in body or OUTLOOK_CALENDAR_ID/OUTLOOK_GRAPH_USER_ID env vars.'
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