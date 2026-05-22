import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export type AppRole = 'admin' | 'client';

type UserProfile = {
  id: string;
  role: AppRole;
  client_id: string | null;
};

type AuthContextValue = {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  activateInviteCode: (code: string) => Promise<{ ok: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      if (!session?.user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, client_id')
        .eq('id', session.user.id)
        .single();

      if (error) {
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
      setLoading(false);
    }

    loadProfile();
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      async activateInviteCode(code: string) {
        const { data, error } = await supabase.functions.invoke('activate-invite-code', {
          body: { code }
        });

        if (error) {
          return { ok: false, message: error.message };
        }

        return {
          ok: Boolean(data?.ok),
          message: data?.message ?? 'Invite code accepted. Sign in to continue.'
        };
      },
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
      },
      async signOut() {
        await supabase.auth.signOut();
      }
    }),
    [loading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
