import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = 
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const missingConfigMessage =
  "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.";

const createSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
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