export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const validationToken = url.searchParams.get('validationToken');
  if (validationToken) {
    return new Response(validationToken, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed' }), { status: 405 });
  }

  const body = (await req.json()) as { value?: Array<{ clientState?: string }> };
  const expectedState = process.env.OUTLOOK_WEBHOOK_CLIENT_STATE;

  const valid = (body.value ?? []).every((item) => item.clientState === expectedState);
  if (!valid) {
    return new Response(JSON.stringify({ ok: false, message: 'Invalid clientState' }), { status: 401 });
  }

  // Notification accepted. Your job/queue should invoke outlook-sync-runner next.
  return new Response(JSON.stringify({ ok: true, accepted: true }), { status: 202 });
}