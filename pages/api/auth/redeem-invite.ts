import { withApi, ApiError } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase/server';
import crypto from 'crypto';

export default withApi(async (req, res) => {
  if (req.method !== 'POST') throw new ApiError('Method not allowed', 405);
  const inviteCode = String(req.body?.inviteCode ?? '');
  const authUserId = String(req.body?.authUserId ?? '');
  if (inviteCode.length < 6 || !/^[0-9a-f-]{36}$/i.test(authUserId)) throw new ApiError('Invalid payload', 422);
  const inviteCodeHash = crypto.createHash('sha256').update(inviteCode).digest('hex');

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id, invite_code_used_at')
    .eq('invite_code_hash', inviteCodeHash)
    .single();

  if (!client || client.invite_code_used_at) throw new ApiError('Invite code invalid or already used', 400);

  await supabaseAdmin.from('profiles').upsert({ auth_user_id: authUserId, role: 'client', client_id: client.id });
  await supabaseAdmin.from('clients').update({ invite_code_used_at: new Date().toISOString() }).eq('id', client.id);
  res.status(200).json({ ok: true, clientId: client.id });
});
