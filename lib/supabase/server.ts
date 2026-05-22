import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  throw new Error('Missing Supabase server env vars');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false },
});
