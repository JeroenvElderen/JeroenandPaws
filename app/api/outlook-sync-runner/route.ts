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
  id: string;
  client_id: string;
  name: string;
};

type ResolvedClient = {
  clientId: string;
  dogId: string | null;
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
  return value.trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function parseClientAndDogsFromSubject(subject: string): {
  firstName: string | null;
  dogNames: string[];
  serviceName: string;
} {
  const [left = '', ...rest] = subject.split('-').map((x) => x.trim()).filter(Boolean);
  const parsed = parseSubject(subject);
  const firstName = left ? normalizeName(left.split(/\s+/)[0] ?? '') : null;

  const dogsFromRight = rest
    .flatMap((segment) => segment.split(/[,&]/))
    .map((name) => normalizeName(name))
    .filter(Boolean)
    .filter((name) => !SERVICE_KEYWORDS.some((kw) => name.includes(kw)));

  const dogNames = (dogsFromRight.length > 0 ? dogsFromRight : parsed.dogNames.map((name) => normalizeName(name)))
    .filter(Boolean)
    .filter((name) => !SERVICE_KEYWORDS.some((kw) => name.includes(kw)));

  return { firstName: firstName || null, dogNames, serviceName: parsed.serviceName };
}

async function resolveClientByNames(
  supabase: SupabaseClient,
  subject: string
): Promise<ResolvedClient | null> {
  const { firstName, dogNames, serviceName } = parseClientAndDogsFromSubject(subject);

  if (!firstName || dogNames.length === 0) {
    console.warn('[outlook-sync-runner] skipped: cannot parse client/dogs from subject', {
      subject,
      firstName,
      dogNamesCount: dogNames.length
    });
    return null;
  }

  const { data: clients, error } = await supabase.from('clients').select('id, full_name');
  if (error) throw new Error(`Failed loading clients: ${error.message}`);

  const matchingClients = ((clients ?? []) as ClientRow[]).filter((client) => {
    const first = normalizeName(String(client.full_name ?? '').split(/\s+/)[0] ?? '');
    return first === firstName;
  });

  if (matchingClients.length === 0) {
    console.warn('[outlook-sync-runner] client resolution failed: no first-name match', { subject, firstName });
    return null;
  }

  const candidateIds = matchingClients.map((client) => client.id);

  const { data: dogs, error: dogsError } = await supabase
    .from('dogs')
    .select('id, client_id, name')
    .in('client_id', candidateIds);

  if (dogsError) throw new Error(`Failed loading dogs: ${dogsError.message}`);

  const dogRows = (dogs ?? []) as DogRow[];

  const matches = candidateIds
    .map((candidateId) => {
      const ownedDogs = dogRows.filter((dog) => dog.client_id === candidateId);
      const matchedDogs = ownedDogs.filter((dog) =>
        dogNames.includes(normalizeName(String(dog.name ?? '')))
      );

      return {
        clientId: candidateId,
        matchedDogs,
        ownedDogNames: ownedDogs.map((dog) => normalizeName(String(dog.name ?? '')))
      };
    })
    .filter((match) => {
      return (
        dogNames.every((name) => match.ownedDogNames.includes(name)) &&
        match.matchedDogs.length > 0
      );
    });

  if (matches.length !== 1) {
    console.warn('[outlook-sync-runner] client resolution failed: ambiguous/no dog match', {
      subject,
      firstName,
      dogNames,
      candidateCount: matchingClients.length,
      resolvedMatches: matches.length
    });
    return null;
  }

  return {
    clientId: matches[0].clientId,
    dogId: matches[0].matchedDogs[0]?.id ?? null,
    dogNames,
    serviceName
  };
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

  const tokenBody = await resp.json().catch(() => ({}));
  console.log('[outlook-sync-runner] token response', { ok: resp.ok, status: resp.status });

  if (!resp.ok) throw new Error(`Token request failed: ${resp.status} ${JSON.stringify(tokenBody)}`);

  const accessToken = (tokenBody as { access_token?: string }).access_token;
  if (!accessToken) throw new Error('Token response missing access_token');

  return accessToken;
}

async function runDeltaSync(
  clientId: string | null,
  calendarId: string,
  graphUserId: string
): Promise<{ imported: number; cancelled: number }> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
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

    const data = (await resp.json().catch(() => ({}))) as {
      value?: GraphEvent[];
      '@odata.nextLink'?: string;
      '@odata.deltaLink'?: string;
      error?: unknown;
    };

    console.log('[outlook-sync-runner] graph delta response', {
      ok: resp.ok,
      status: resp.status,
      valueCount: data.value?.length ?? 0,
      hasNextLink: Boolean(data['@odata.nextLink']),
      hasDeltaLink: Boolean(data['@odata.deltaLink'])
    });

    if (!resp.ok) throw new Error(`Graph delta failed: ${resp.status} ${JSON.stringify(data.error ?? data)}`);

    collected.push(...(data.value ?? []));
    url = data['@odata.nextLink'] ?? '';

    if (data['@odata.deltaLink']) deltaLink = data['@odata.deltaLink'];
    if (!url) break;
  }

  console.log('[outlook-sync-runner] collected events', { total: collected.length });

  const deletedEventIds = collected.filter((e) => Boolean(e['@removed'])).map((e) => e.id);

  const upsertRows = collected
    .filter((e) => !e['@removed'])
    .map((event) => {
      const parsed = parseSubject(event.subject ?? '');

      return {
        client_id: clientId,
        dog_id: null as string | null,
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
    .filter((r) => {
      const valid = Boolean(r.starts_at && r.ends_at);

      if (!valid) {
        console.warn('[outlook-sync-runner] skipped row: missing starts_at/ends_at', {
          eventId: r.outlook_event_id,
          starts_at: r.starts_at,
          ends_at: r.ends_at,
          title: r.title
        });
      }

      return valid;
    });

  const resolvedRows: typeof upsertRows = [];

  for (const row of upsertRows) {
    if (row.client_id) {
      resolvedRows.push(row);
      continue;
    }

    const resolved = await resolveClientByNames(supabase, row.title ?? '');

    if (!resolved) {
      console.warn('[outlook-sync-runner] skipped row: unresolved client', {
        eventId: row.outlook_event_id,
        title: row.title
      });
      continue;
    }

    resolvedRows.push({
      ...row,
      client_id: resolved.clientId,
      dog_id: resolved.dogId,
      dog_names: resolved.dogNames,
      service_name: row.service_name === 'unknown' ? resolved.serviceName : row.service_name
    });
  }

  if (resolvedRows.length > 0) {
    const { error } = await supabase.from('bookings').upsert(resolvedRows, {
      onConflict: 'outlook_event_id'
    });

    if (error) {
      console.error('[outlook-sync-runner] supabase upsert error', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      throw new Error(error.message);
    }
  }

  console.log('[outlook-sync-runner] rows upserted', { count: resolvedRows.length });

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

    const { error } = await supabase.from('outlook_sync_cursors').upsert(row, {
      onConflict: 'client_id'
    });

    if (error) throw new Error(error.message);
  }

  return { imported: resolvedRows.length, cancelled: deletedEventIds.length };
}

export async function POST(req: Request): Promise<Response> {
  const auth = req.headers.get('authorization') ?? '';
  const cronHeader = req.headers.get('x-vercel-cron');

  const authorized =
    auth === `Bearer ${process.env.OUTLOOK_SYNC_SECRET}` ||
    cronHeader === '1';

  if (!authorized) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Unauthorized'
      }),
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    clientId?: string;
    calendarId?: string;
    graphUserId?: string;
  };

  const clientId = body.clientId ?? null;

  const calendarId =
    body.calendarId ?? process.env.OUTLOOK_CALENDAR_ID;

  const graphUserId =
    body.graphUserId ??
    process.env.OUTLOOK_GRAPH_USER_ID ??
    process.env.NEXT_PUBLIC_OUTLOOK_CALENDAR_EMAIL;

  if (!calendarId || !graphUserId) {
    return new Response(
      JSON.stringify({
        ok: false,
        message:
          'Missing calendar config. Provide calendarId/graphUserId in body or OUTLOOK_CALENDAR_ID/OUTLOOK_GRAPH_USER_ID env vars.'
      }),
      { status: 400 }
    );
  }

  try {
    const result = await runDeltaSync(
      clientId,
      calendarId,
      graphUserId
    );

    return new Response(
      JSON.stringify({
        ok: true,
        ...result
      }),
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Sync failed';

    console.error(
      '[outlook-sync-runner] request failed',
      { message }
    );

    return new Response(
      JSON.stringify({
        ok: false,
        message
      }),
      { status: 500 }
    );
  }
}

export async function GET(req: Request): Promise<Response> {
  return POST(req);
}