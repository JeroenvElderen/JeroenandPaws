import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
  profile: null,
  isAuthenticated: false,
  setProfile: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('jp_client_profile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.warn('Unable to restore saved profile', error);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    try {
      if (profile) {
        localStorage.setItem('jp_client_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('jp_client_profile');
      }
    } catch (error) {
      console.warn('Unable to persist profile', error);
    }
  }, [profile, hasHydrated]);

  const value = useMemo(
    () => ({
      profile,
      isAuthenticated: Boolean(profile?.client?.id),
      setProfile,
      logout: () => setProfile(null),
    }),
    [profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);