export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const validationToken = url.searchParams.get('validationToken');
  if (validationToken) {
    return new Response(validationToken, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed' }), { status: 405 });
  }

  const body = (await req.json().catch(() => ({}))) as { value?: Array<{ clientState?: string }> };
  const expectedState = process.env.OUTLOOK_WEBHOOK_CLIENT_STATE;

  const valid = (body.value ?? []).every((item) => item.clientState === expectedState);
  if (!valid) {
    return new Response(JSON.stringify({ ok: false, message: 'Invalid clientState' }), { status: 401 });
  }

  const runnerUrl = process.env.OUTLOOK_SYNC_RUNNER_URL;
  if (!runnerUrl) {
    console.error('[outlook-webhook] missing OUTLOOK_SYNC_RUNNER_URL');
    return new Response(JSON.stringify({ ok: false, message: 'Missing OUTLOOK_SYNC_RUNNER_URL' }), { status: 500 });
  }

  const syncResponse = await fetch(runnerUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OUTLOOK_SYNC_SECRET ?? ''}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  const syncBodyText = await syncResponse.text();
  if (!syncResponse.ok) {
    console.error('[outlook-webhook] sync runner call failed', {
      status: syncResponse.status,
      body: syncBodyText
    });
    return new Response(JSON.stringify({ ok: false, message: 'Sync runner failed', status: syncResponse.status }), { status: 502 });
  }

  return new Response(
    JSON.stringify({ ok: true, accepted: true, runnerStatus: syncResponse.status, runnerResponse: syncBodyText }),
    { status: 202 }
  );
}