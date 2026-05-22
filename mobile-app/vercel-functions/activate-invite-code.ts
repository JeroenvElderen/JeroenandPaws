import { createClient } from '@supabase/supabase-js';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed' }), { status: 405 });
  }

  const { code, userId } = await req.json();
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: invite } = await supabase
    .from('invite_codes')
    .select('id, client_id, status')
    .eq('code', String(code).trim().toUpperCase())
    .single();

  if (!invite || invite.status !== 'pending') {
    return new Response(JSON.stringify({ ok: false, message: 'Invite code is invalid or already used.' }), { status: 400 });
  }

  await supabase
    .from('invite_codes')
    .update({ status: 'used', used_at: new Date().toISOString(), used_by_user_id: userId })
    .eq('id', invite.id);

  await supabase.from('profiles').upsert({ id: userId, role: 'client', client_id: invite.client_id });

  return new Response(JSON.stringify({ ok: true, message: 'Invite code activated.' }), { status: 200 });
}
