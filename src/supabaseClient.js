import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const missingConfigMessage =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

const createSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

export const supabase =
  supabaseUrl && supabaseAnonKey ? createSupabaseClient() : null;

if (!supabase) {
  // eslint-disable-next-line no-console
  console.warn(missingConfigMessage);
}

export const requireSupabaseClient = () => {
  if (!supabase) {
    throw new Error(missingConfigMessage);
  }

  return supabase;
};
