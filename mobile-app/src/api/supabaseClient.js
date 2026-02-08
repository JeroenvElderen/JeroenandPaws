import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const extraConfig =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  Constants.manifest2?.extra ??
  {};

const supabaseUrl =
  extraConfig.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  extraConfig.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  extraConfig.supabaseServiceRoleKey ||
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY;
const missingConfigMessage =
  "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.";

const createSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: AsyncStorage,
    },
  });

export const supabase =
  supabaseUrl && supabaseAnonKey ? createSupabaseClient() : null;

if (!supabase) {
  // eslint-disable-next-line no-console
  console.warn(missingConfigMessage);
}

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
          storage: AsyncStorage,
        },
      })
    : null;
    
export const requireSupabaseClient = () => {
  if (!supabase) {
    throw new Error(missingConfigMessage);
  }

  return supabase;
};