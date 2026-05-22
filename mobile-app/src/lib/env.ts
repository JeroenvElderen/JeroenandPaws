import Constants from 'expo-constants';

type ExtraConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  vercelBackendUrl?: string;
  apiDryRunExternal?: string;
  apiDryRunEmailTo?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

export const env = {
  supabaseUrl: extra.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  vercelBackendUrl: extra.vercelBackendUrl ?? process.env.EXPO_PUBLIC_VERCEL_BACKEND_URL ?? '',
  apiDryRunExternal: (extra.apiDryRunExternal ?? process.env.EXPO_PUBLIC_API_DRY_RUN_EXTERNAL ?? 'true') === 'true',
  apiDryRunEmailTo: extra.apiDryRunEmailTo ?? process.env.EXPO_PUBLIC_API_DRY_RUN_EMAIL_TO ?? 'jeroen@jeroenandpaws.com',
};

export function assertEnv(): void {
  const missing = Object.entries({
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
    vercelBackendUrl: env.vercelBackendUrl,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing environment configuration: ${missing.join(', ')}`);
  }
}
