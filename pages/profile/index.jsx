import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';

const brand = {
  primary: '#7c45f3',
  primarySoft: '#7c45f31a',
  neutral: '#0c081f',
  ink: '#f4f2ff',
  muted: '#c9c5d8',
  background:
   'radial-gradient(circle at 12% 18%, rgba(124, 69, 243, 0.08), transparent 28%), \n radial-gradient(circle at 88% 6%, rgba(255, 214, 150, 0.08), transparent 30%), \n #0c081f',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardShadow: '0 24px 80px rgba(0, 0, 0, 0.55)',
  subtleText: '#c9c5d8',
  surface: 'linear-gradient(150deg, #1f1535, #120d23)',
  surfaceHighlight: 'linear-gradient(150deg, #251a3f, #150f28)',
};

const pillStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: brand.primary,
  fontWeight: 700,
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  letterSpacing: '0.01em',
};

const SectionCard = ({ title, description, children }) => (
  <section
    style={{
      background: brand.surface,
      borderRadius: '20px',
      padding: '24px',
      boxShadow: brand.cardShadow,
      border: `1px solid ${brand.cardBorder}`,
      color: brand.ink,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
      <div>
        <h2 style={{ margin: 0, color: brand.ink, fontSize: '1.4rem' }}>{title}</h2>
        {description && <p style={{ margin: '6px 0 16px', color: brand.subtleText }}>{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const emptyStateStyle = {
  background: 'rgba(124, 69, 243, 0.08)',
  border: `1px dashed ${brand.cardBorder}`,
  borderRadius: '16px',
  padding: '16px',
  color: brand.subtleText,
  textAlign: 'center',
};

const mockProfile = {
  client: {
    id: 'demo-client',
    full_name: 'Jeroen & Paws Guest',
    email: 'demo@jeroenandpaws.com',
    phone_number: '+1 (555) 123-4567',
  },
  pets: [
    { id: 'pet-1', name: 'Luna', breed: 'Golden Retriever', notes: 'Loves long walks and peanut butter treats.' },
    { id: 'pet-2', name: 'Milo', breed: 'Corgi', notes: 'Keep an eye on the zoomies after lunch.' },
  ],
  bookings: [
    {
      id: 'booking-1',
      service_title: 'Training Session',
      start_at: new Date(Date.now() + 86400000).toISOString(),
      end_at: new Date(Date.now() + 9000000).toISOString(),
      status: 'confirmed',
      notes: 'Focus on loose leash walking.',
    },
    {
      id: 'booking-2',
      service_title: 'Daycare',
      start_at: new Date(Date.now() + 172800000).toISOString(),
      end_at: new Date(Date.now() + 180000000).toISOString(),
      status: 'confirmed',
      notes: 'Please offer a frozen Kong at nap time.',
    },
  ],
};

const useMockProfile = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_MOCK_PROFILE === 'true';

const formatDateRange = (booking) => {
  if (!booking?.start_at || !booking?.end_at) return 'Scheduled time pending';

  const start = new Date(booking.start_at);
  const end = new Date(booking.end_at);
  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${start.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })} — ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const bookingStatusLabel = (status = '') => {
  const normalized = status.toLowerCase();

  if (!normalized || normalized === 'pending') return 'Waiting confirmation';
  if (['scheduled', 'confirmed'].includes(normalized)) return 'Scheduled';
  if (['cancelled', 'canceled'].includes(normalized)) return 'Cancelled';
  return status;
};

const ProfilePage = () => {
  const { profile: authProfile, setProfile: setAuthProfile, logout: clearAuth } = useAuth();
  const initialProfile = useMockProfile ? mockProfile : authProfile;
  const apiBaseUrl = useMemo(() => {
    const configuredBase = (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '').replace(/\/$/, '');

    if (configuredBase) return configuredBase;

    if (typeof window !== 'undefined') {
      return window.location.origin.replace(/\/$/, '');
    }

    return '';
  }, []);

  const [email, setEmail] = useState(initialProfile?.client?.email || '');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactForm, setContactForm] = useState({
    fullName: initialProfile?.client?.full_name || '',
    phone: initialProfile?.client?.phone_number || '',
    email: initialProfile?.client?.email || '',
    address: initialProfile?.client?.address || '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    breed: '',
    notes: '',
    photoDataUrl: null,
    photoName: '',
  });
  const [editingPets, setEditingPets] = useState({});
  const [resetEmail, setResetEmail] = useState(initialProfile?.client?.email || '');
  const [resetStatus, setResetStatus] = useState({ state: 'idle', message: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingAction, setBookingAction] = useState({ cancelling: false, error: '' });

  const activeBookings = useMemo(() => {
    const clean = (status = '') => status?.toLowerCase();
    return (profile?.bookings || []).filter(
      (booking) => !['cancelled', 'canceled'].includes(clean(booking.status))
    );
  }, [profile]);

  const hasPets = useMemo(() => profile?.pets?.length > 0, [profile]);
  const hasBookings = useMemo(() => activeBookings.length > 0, [activeBookings]);

  const refreshContactForm = useCallback((payload) => {
    setContactForm({
      fullName: payload?.client?.full_name || '',
      phone: payload?.client?.phone_number || '',
      email: payload?.client?.email || '',
      address: payload?.client?.address || '',
    });
    setResetEmail(payload?.client?.email || '');
  }, []);

  const persistProfileState = (nextProfileOrUpdater) => {
    setProfile((previous) => {
      const nextProfile =
        typeof nextProfileOrUpdater === 'function'
          ? nextProfileOrUpdater(previous)
          : nextProfileOrUpdater;

      if (nextProfile === undefined) {
        return previous;
      }

      if (!nextProfile) {
        if (!useMockProfile) {
          setAuthProfile(null);
        }
        refreshContactForm(null);
        setEmail('');
        return null;
      }

      if (!useMockProfile) {
        setAuthProfile(nextProfile);
      }
      refreshContactForm(nextProfile);
      setEmail(nextProfile?.client?.email || '');
      return nextProfile;
    });
  };

  useEffect(() => {
    if (useMockProfile) {
      setProfile(mockProfile);
      refreshContactForm(mockProfile);
      setEmail(mockProfile?.client?.email || '');
      setResetEmail(mockProfile?.client?.email || '');
      return;
    }

    if (authProfile) {
      setProfile(authProfile);
      refreshContactForm(authProfile);
      setEmail(authProfile?.client?.email || '');
      setResetEmail(authProfile?.client?.email || '');
      return;
    }

    setProfile(null);
    setContactForm({ fullName: '', phone: '', email: '', address: '' });
    setEmail('');
    setResetEmail('');
  }, [authProfile, refreshContactForm, useMockProfile]);

  const loadProfile = async () => {
    if (!email || !password) {
      setError('Please enter both email and password to view your profile.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/client-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Profile not found');
      }

      persistProfileState(payload);
    } catch (err) {
      setError(err.message || 'Could not load profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (useMockProfile || !profile?.client?.email) return;

      try {
        const response = await fetch(
          `/api/client-bookings?email=${encodeURIComponent(profile.client.email)}`
        );
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || 'Could not load bookings');
        }

        persistProfileState((currentProfile) => ({
          ...currentProfile,
          bookings: payload.bookings || [],
        }));
      } catch (err) {
        console.error('Failed to refresh bookings', err);
      }
    };

    fetchBookings();
  }, [profile?.client?.email, useMockProfile]);
  
  useEffect(() => {
    const refreshPetPhotos = async () => {
      if (useMockProfile || !profile?.client?.email) return;

      try {
        const response = await fetch(
          `/api/pets?ownerEmail=${encodeURIComponent(profile.client.email)}`
        );
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || 'Could not refresh pets');
        }

        persistProfileState((currentProfile) => ({
          ...currentProfile,
          pets: payload.pets || [],
        }));
      } catch (err) {
        console.error('Failed to refresh pet photos', err);
      }
    };

    refreshPetPhotos();
  }, [profile?.client?.email, useMockProfile]);
  
  const saveContact = async () => {
    if (!contactForm.email) {
      setError('Email is required to save your details.');
      return;
    }
    setSavingContact(true);
    setError('');

    try {
      const response = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile?.client?.id,
          email: profile?.client?.email,
          newEmail: contactForm.email,
          fullName: contactForm.fullName,
          phone: contactForm.phone,
          address: contactForm.address,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Could not save your details');
      }

      persistProfileState((currentProfile) => ({
        ...currentProfile,
        client: payload.client,
      }));
    } catch (err) {
      setError(err.message || 'Unable to save details');
    } finally {
      setSavingContact(false);
    }
  };

  const savePassword = async () => {
    if (!contactForm.email) {
      setError('Email is required to save your details.');
      return;
    }

    if (!currentPasswordInput || !newPassword || !confirmPassword) {
      setError('Please complete all password fields to continue.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation must match.');
      return;
    }

    setSavingPassword(true);
    setError('');
    try {
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactForm.email,
          password: newPassword,
          currentPassword: currentPasswordInput,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Could not update password');
      }

      const nextProfile = { ...profile, client: payload.client };
      persistProfileState(nextProfile);
      setPassword(newPassword);
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || 'Unable to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleNewPetPhotoChange = async (file) => {
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    setNewPet((prev) => ({
      ...prev,
      photoDataUrl: dataUrl,
      photoName: file.name,
    }));
  };

  const handleExistingPetPhotoChange = async (petId, file) => {
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    updatePetField(petId, 'photoDataUrl', dataUrl);
    updatePetField(petId, 'photoName', file.name);
  };

  const clearExistingPetPhoto = (petId) => {
    updatePetField(petId, 'photoDataUrl', null);
    updatePetField(petId, 'photo_data_url', null);
    updatePetField(petId, 'photoName', '');
  };

  const clearNewPetPhoto = () =>
    setNewPet((prev) => ({ ...prev, photoDataUrl: null, photoName: '' }));

  const createPet = async () => {
    try {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail: contactForm.email || email, ...newPet }),
      });

      if (!response.ok) {
        throw new Error('Could not save pet');
      }

      setNewPet({ name: '', breed: '', notes: '', photoDataUrl: null, photoName: '' });
      await loadProfile();
    } catch (err) {
      setError(err.message || 'Unable to save pet');
    }
  };

  const startEditingPet = (pet) => {
    setEditingPets((prev) => ({ ...prev, [pet.id]: { ...pet } }));
  };

  const stopEditingPet = (petId) => {
    setEditingPets((prev) => {
      const next = { ...prev };
      delete next[petId];
      return next;
    });
  };

  const updatePetField = (petId, field, value) => {
    setEditingPets((prev) => ({
      ...prev,
      [petId]: { ...prev[petId], [field]: value },
    }));
  };

  const savePetEdit = async (petId) => {
    const petPayload = editingPets[petId];
    if (!petPayload) return;
    try {
      const response = await fetch('/api/pets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail: contactForm.email || email, ...petPayload }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || 'Could not update pet');
      }

      persistProfileState((currentProfile) => {
        const nextPets = (currentProfile?.pets || []).map((pet) =>
          pet.id === petId ? payload.pet : pet
        );
        return { ...currentProfile, pets: nextPets };
      });
      stopEditingPet(petId);
    } catch (err) {
      setError(err.message || 'Unable to update pet');
    }
  };

  const openBooking = (booking) => {
    setSelectedBooking(booking);
    setBookingAction({ cancelling: false, error: '' });
  };

  const cancelBooking = async () => {
    if (!selectedBooking) return;

    setBookingAction({ cancelling: true, error: '' });
    try {
      const response = await fetch('/api/client-bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedBooking.id, clientEmail: contactForm.email || email }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Could not cancel booking');
      }

      persistProfileState((currentProfile) => {
        const nextBookings = (currentProfile?.bookings || []).map((booking) =>
          booking.id === selectedBooking.id ? payload.booking : booking
        );
        return { ...currentProfile, bookings: nextBookings };
      });
      setSelectedBooking(payload.booking);
    } catch (err) {
      setBookingAction({ cancelling: false, error: err.message || 'Unable to cancel booking' });
    } finally {
      setBookingAction((prev) => ({ ...prev, cancelling: false }));
    }
  };

  const requestPasswordReset = async () => {
    if (!resetEmail) {
      setResetStatus({ state: 'error', message: 'Please enter your email address.' });
      return;
    }

    setResetStatus({ state: 'loading', message: '' });
    try {
      const response = await fetch('/api/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Could not submit your request.');
      }

      setResetStatus({
        state: 'success',
        message: 'Check your inbox for the next steps to reset your password.',
      });
    } catch (err) {
      setResetStatus({
        state: 'error',
        message: err.message || 'Unable to process your request right now.',
      });
    }
  };

  const signOut = () => {
    setProfile(null);
    clearAuth?.();
    setContactForm({ fullName: '', phone: '', email: '', address: '' });
    setPassword('');
    setSelectedBooking(null);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: brand.background,
        padding: '32px 16px 48px',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <header
          style={{
            background: `linear-gradient(120deg, ${brand.primary} 0%, #5d3ce6 45%, ${brand.neutral} 100%)`,
            color: 'white',
            borderRadius: '28px',
            padding: '32px',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15), transparent 30%),\n               radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.12), transparent 35%)',
            }}
          />
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={pillStyles}>
                <span role="img" aria-label="sparkles">
                  ✨
                </span>
                Your client hub
              </div>
              <h1 style={{ margin: '12px 0 8px', fontSize: '2.4rem', lineHeight: 1.2 }}>Profile & Booking Center</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', fontSize: '1rem', lineHeight: 1.6 }}>
                Manage your contact details, pets, and bookings with the same styling as our Webflow hub.
              </p>
            </div>
            {!profile ? (
              <div
                style={{
                  flex: '1 1 280px',
                  background: brand.surfaceHighlight,
                  borderRadius: '18px',
                  padding: '16px',
                  border: `1px solid ${brand.cardBorder}`,
                  boxShadow: brand.cardShadow,
                }}
              >
                <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>Access your profile</p>
                <p style={{ margin: '0 0 12px', color: 'rgba(255,255,255,0.75)' }}>
                  Use the email you provided when booking with us.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: '1 1 200px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      flex: '1 1 180px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                    }}
                  />
                  <button
                    type="button"
                    onClick={loadProfile}
                    disabled={loading || !email || !password}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#22c55e',
                      color: '#0f172a',
                      fontWeight: 800,
                      cursor: loading || !email ? 'not-allowed' : 'pointer',
                      boxShadow: '0 12px 30px rgba(34, 197, 94, 0.35)',
                    }}
                  >
                    {loading ? 'Loading…' : 'View profile'}
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  flex: '1 1 280px',
                  background: brand.surfaceHighlight,
                  borderRadius: '18px',
                  padding: '16px',
                  border: `1px solid ${brand.cardBorder}`,
                  boxShadow: brand.cardShadow,
                  color: 'white',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>Signed in</p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
                      {contactForm.fullName || 'Client'} · {contactForm.email}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={loadProfile}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.16)',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Refresh data
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: brand.primary,
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div style={{ marginTop: '28px', display: 'grid', gap: '20px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecdd3',
                color: '#b91c1c',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {profile ? (
            <>
              <SectionCard
                title="Your details"
                description="Update your contact information, password, and login email."
              >
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: brand.subtleText, fontWeight: 700 }}>Full name</label>
                    <input
                      type="text"
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${brand.cardBorder}`,
                        background: 'rgba(255,255,255,0.04)',
                        color: brand.ink,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: brand.subtleText, fontWeight: 700 }}>Phone</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${brand.cardBorder}`,
                        background: 'rgba(255,255,255,0.04)',
                        color: brand.ink,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: brand.subtleText, fontWeight: 700 }}>Service address</label>
                    <textarea
                      value={contactForm.address}
                      onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                      placeholder="Where should we meet you?"
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${brand.cardBorder}`,
                        background: 'rgba(255,255,255,0.04)',
                        color: brand.ink,
                        minHeight: '72px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: brand.subtleText, fontWeight: 700 }}>Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${brand.cardBorder}`,
                        background: 'rgba(255,255,255,0.04)',
                        color: brand.ink,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: brand.subtleText, fontWeight: 700 }}>Change password</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !showPasswordForm;
                          setShowPasswordForm(next);
                          if (!next) {
                            setCurrentPasswordInput('');
                            setNewPassword('');
                            setConfirmPassword('');
                          } else {
                            setError('');
                          }
                        }}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: `1px solid ${brand.cardBorder}`,
                          background: brand.surfaceHighlight,
                          color: brand.ink,
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: brand.cardShadow,
                        }}
                      >
                        {showPasswordForm ? 'Close password form' : 'Change password'}
                      </button>

                      {showPasswordForm && (
                        <div
                          style={{
                            display: 'grid',
                            gap: '10px',
                            borderRadius: '14px',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${brand.cardBorder}`,
                          }}
                        >
                          <input
                            type="password"
                            placeholder="Current password"
                            value={currentPasswordInput}
                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                            style={{
                              padding: '12px',
                              borderRadius: '12px',
                              border: `1px solid ${brand.cardBorder}`,
                              background: 'rgba(255,255,255,0.04)',
                              color: brand.ink,
                            }}
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{
                              padding: '12px',
                              borderRadius: '12px',
                              border: `1px solid ${brand.cardBorder}`,
                              background: 'rgba(255,255,255,0.04)',
                              color: brand.ink,
                            }}
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                              padding: '12px',
                              borderRadius: '12px',
                              border: `1px solid ${brand.cardBorder}`,
                              background: 'rgba(255,255,255,0.04)',
                              color: brand.ink,
                            }}
                          />
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              justifyContent: 'flex-end',
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setShowPasswordForm(false);
                                setCurrentPasswordInput('');
                                setNewPassword('');
                                setConfirmPassword('');
                              }}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '12px',
                                border: `1px solid ${brand.cardBorder}`,
                                background: 'transparent',
                                color: brand.subtleText,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={savePassword}
                              disabled={savingPassword}
                              style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                background: savingPassword ? brand.primarySoft : brand.primary,
                                color: 'white',
                                fontWeight: 800,
                                cursor: savingPassword ? 'not-allowed' : 'pointer',
                                boxShadow: brand.cardShadow,
                              }}
                            >
                              {savingPassword ? 'Saving…' : 'Update password'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={saveContact}
                    disabled={savingContact}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: savingContact ? brand.primarySoft : brand.primary,
                      color: 'white',
                      fontWeight: 800,
                      cursor: savingContact ? 'not-allowed' : 'pointer',
                      boxShadow: brand.cardShadow,
                    }}
                  >
                    {savingContact ? 'Saving…' : 'Save details'}
                  </button>
                </div>
              </SectionCard>

              <SectionCard
                title="Your pets"
                description="Open any card to edit names, breeds, or notes."
              >
                {hasPets ? (
                  <div
                    style={{
                      display: 'grid',
                      gap: '12px',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    }}
                  >
                    {profile.pets.map((pet) => {
                      const isEditing = Boolean(editingPets[pet.id]);
                      const editing = editingPets[pet.id] || {};
                      const petPhoto =
                        editing.photoDataUrl ||
                        editing.photo_data_url ||
                        pet.photo_data_url;
                      const petInitial = (pet.name || '?').charAt(0).toUpperCase();
                      return (
                        <div
                          key={pet.id}
                          style={{
                            border: `1px solid ${brand.cardBorder}`,
                            borderRadius: '16px',
                            padding: '16px',
                            background: brand.surfaceHighlight,
                            boxShadow: brand.cardShadow,
                            display: 'grid',
                            gap: '10px',
                            color: brand.ink,
                          }}
                        >
                          {!isEditing ? (
                            <>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {petPhoto ? (
                                    <img
                                      src={petPhoto}
                                      alt={`${pet.name} profile`}
                                      style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '14px',
                                        objectFit: 'cover',
                                        border: `1px solid ${brand.cardBorder}`,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '14px',
                                        background: brand.primarySoft,
                                        color: brand.primary,
                                        display: 'grid',
                                        placeItems: 'center',
                                        fontWeight: 800,
                                        border: `1px solid ${brand.cardBorder}`,
                                      }}
                                    >
                                      {petInitial}
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: brand.ink }}>{pet.name}</div>
                                    {pet.breed && (
                                      <span
                                        style={{
                                          display: 'inline-block',
                                          marginTop: '6px',
                                          background: brand.primary,
                                          color: brand.ink,
                                          padding: '6px 10px',
                                          borderRadius: '999px',
                                          fontSize: '0.85rem',
                                          fontWeight: 700,
                                          border: `1px solid ${brand.cardBorder}`,
                                        }}
                                      >
                                        {pet.breed}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {pet.notes ? (
                                <p style={{ margin: 0, color: brand.subtleText }}>{pet.notes}</p>
                              ) : (
                                <p style={{ margin: 0, color: '#9ca3af' }}>No notes added yet.</p>
                              )}
                              <button
                                type="button"
                                onClick={() => startEditingPet(pet)}
                                style={{
                                  justifySelf: 'flex-start',
                                  padding: '10px 14px',
                                  borderRadius: '12px',
                                  border: `1px solid ${brand.cardBorder}`,
                                  background: brand.primary,
                                  color: brand.ink,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Edit pet
                              </button>
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'grid', gap: '8px' }}>
                                <input
                                  type="text"
                                  value={editing.name || ''}
                                  onChange={(e) => updatePetField(pet.id, 'name', e.target.value)}
                                  style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: `1px solid ${brand.cardBorder}`,
                                    background: 'rgba(255,255,255,0.04)',
                                    color: brand.ink,
                                  }}
                                />
                                <input
                                  type="text"
                                  value={editing.breed || ''}
                                  onChange={(e) => updatePetField(pet.id, 'breed', e.target.value)}
                                  placeholder="Breed"
                                  style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: `1px solid ${brand.cardBorder}`,
                                    background: 'rgba(255,255,255,0.04)',
                                    color: brand.ink,
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ color: brand.subtleText, fontWeight: 700 }}>Profile photo</label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleExistingPetPhotoChange(
                                          pet.id,
                                          e.target.files?.[0]
                                        )
                                      }
                                      style={{
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: `1px solid ${brand.cardBorder}`,
                                        background: 'rgba(255,255,255,0.04)',
                                        color: brand.ink,
                                      }}
                                    />
                                  </div>
                                  {(editing.photoDataUrl || editing.photo_data_url) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <img
                                        src={editing.photoDataUrl || editing.photo_data_url}
                                        alt={`${editing.name || pet.name} preview`}
                                        style={{
                                          width: '72px',
                                          height: '72px',
                                          borderRadius: '14px',
                                          objectFit: 'cover',
                                          border: `1px solid ${brand.cardBorder}`,
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => clearExistingPetPhoto(pet.id)}
                                        style={{
                                          padding: '8px 12px',
                                          borderRadius: '10px',
                                          border: `1px solid ${brand.cardBorder}`,
                                          background: 'rgba(255,255,255,0.06)',
                                          color: brand.ink,
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Remove photo
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <textarea
                                  value={editing.notes || ''}
                                  onChange={(e) => updatePetField(pet.id, 'notes', e.target.value)}
                                  placeholder="Notes"
                                  style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: `1px solid ${brand.cardBorder}`,
                                    minHeight: '80px',
                                    background: 'rgba(255,255,255,0.04)',
                                    color: brand.ink,
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => stopEditingPet(pet.id)}
                                  style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: `1px solid ${brand.cardBorder}`,
                                    background: 'rgba(255,255,255,0.06)',
                                    color: brand.ink,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => savePetEdit(pet.id)}
                                  style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: brand.primary,
                                    color: '#fff',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: brand.cardShadow,
                                  }}
                                >
                                  Save pet
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={emptyStateStyle}>
                    <p style={{ margin: 0 }}>
                      <strong>Ready to add a pet?</strong> Your companions will show here with their favorite details.
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: '18px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: brand.surface,
                    border: `1px solid ${brand.cardBorder}`,
                    color: brand.ink,
                  }}
                >
                  <h3 style={{ margin: '0 0 10px', color: brand.ink }}>Add a new pet</h3>
                  <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>Name</label>
                      <input
                        type="text"
                        placeholder="Luna"
                        value={newPet.name}
                        onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: `1px solid ${brand.cardBorder}`,
                          background: 'rgba(255,255,255,0.04)',
                          color: brand.ink,
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>Profile photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleNewPetPhotoChange(e.target.files?.[0])}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: `1px solid ${brand.cardBorder}`,
                          background: 'rgba(255,255,255,0.04)',
                          color: brand.ink,
                        }}
                      />
                      {newPet.photoDataUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={newPet.photoDataUrl}
                            alt={`${newPet.name || 'New pet'} preview`}
                            style={{
                              width: '72px',
                              height: '72px',
                              borderRadius: '14px',
                              objectFit: 'cover',
                              border: `1px solid ${brand.cardBorder}`,
                            }}
                          />
                          <button
                            type="button"
                            onClick={clearNewPetPhoto}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: `1px solid ${brand.cardBorder}`,
                              background: 'rgba(255,255,255,0.06)',
                              color: brand.ink,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Remove photo
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>Breed</label>
                      <input
                        type="text"
                        placeholder="Golden Retriever"
                        value={newPet.breed}
                        onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: `1px solid ${brand.cardBorder}`,
                          background: 'rgba(255,255,255,0.04)',
                          color: brand.ink,
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ color: brand.subtleText, fontWeight: 700 }}>Notes</label>
                      <textarea
                        placeholder="Feeding instructions, personality notes, medication..."
                        value={newPet.notes}
                        onChange={(e) => setNewPet({ ...newPet, notes: e.target.value })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: `1px solid ${brand.cardBorder}`,
                          background: 'rgba(255,255,255,0.04)',
                          color: brand.ink,
                          minHeight: '90px',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={createPet}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: brand.primary,
                        color: 'white',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: brand.cardShadow,
                      }}
                    >
                      Save pet
                    </button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Bookings"
                description="Tap a booking to view details or cancel. Cancelled bookings are hidden."
              >
                {hasBookings ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                    {activeBookings.map((booking) => (
                      <li
                        key={booking.id}
                        onClick={() => openBooking(booking)}
                        style={{
                          background: brand.surfaceHighlight,
                          border: `1px solid ${brand.cardBorder}`,
                          borderRadius: '16px',
                          padding: '14px',
                          boxShadow: brand.cardShadow,
                          cursor: 'pointer',
                          transition: 'transform 150ms ease, box-shadow 150ms ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div>
                            <p style={{ margin: '0 0 4px', fontWeight: 800, color: brand.primary }}>
                              {booking.service_title || booking?.services_catalog?.title || 'Service'}
                            </p>
                            <p style={{ margin: 0, color: brand.subtleText, fontWeight: 600 }}>{formatDateRange(booking)}</p>
                          </div>
                          <span
                            style={{
                              background: brand.primary,
                              color: brand.ink,
                              padding: '6px 12px',
                              borderRadius: '999px',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              border: `1px solid ${brand.cardBorder}`,
                              textTransform: 'capitalize',
                            }}
                          >
                            {bookingStatusLabel(booking.status)}
                          </span>
                        </div>
                        {booking.notes && <p style={{ margin: '8px 0 0', color: brand.subtleText }}>{booking.notes}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={emptyStateStyle}>
                    <p style={{ margin: 0 }}>
                      <strong>No bookings yet.</strong> Bookings will appear here with times, services, and notes.
                    </p>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Need a password reset link?"
                description="We'll email you instructions to reset your password if needed."
              >
                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                    gridTemplateColumns: '2fr 1fr',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: brand.subtleText, fontWeight: 700 }}>Email address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${brand.cardBorder}`,
                        background: 'rgba(255,255,255,0.04)',
                        color: brand.ink,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={requestPasswordReset}
                      disabled={resetStatus.state === 'loading'}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: resetStatus.state === 'loading' ? brand.primarySoft : brand.primary,
                        color: 'white',
                        fontWeight: 800,
                        cursor: resetStatus.state === 'loading' ? 'not-allowed' : 'pointer',
                        boxShadow: brand.cardShadow,
                        width: '100%',
                      }}
                    >
                      {resetStatus.state === 'loading' ? 'Sending…' : 'Send reset request'}
                    </button>
                  </div>
                </div>
                {resetStatus.message && (
                  <p
                    style={{
                      margin: '12px 0 0',
                      color: resetStatus.state === 'success' ? '#15803d' : '#b91c1c',
                      fontWeight: 700,
                    }}
                  >
                    {resetStatus.message}
                  </p>
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard
              title="Welcome back"
              description="Enter your email above to unlock your personalized client hub."
            >
              <div style={{ ...emptyStateStyle, background: brand.primarySoft }}>
                <p style={{ margin: 0 }}>
                  <strong>Tip:</strong> Use the same email you used during booking to instantly load your profile.
                </p>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'grid',
            placeItems: 'center',
            padding: '16px',
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '20px',
              width: 'min(520px, 96vw)',
              boxShadow: brand.cardShadow,
              border: `1px solid ${brand.cardBorder}`,
              display: 'grid',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: brand.neutral }}>Booking details</h3>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: brand.subtleText,
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: 0, color: brand.primary, fontWeight: 800 }}>
              {selectedBooking.service_title || selectedBooking?.services_catalog?.title || 'Service'}
            </p>
            <p style={{ margin: 0, color: brand.neutral, fontWeight: 600 }}>{formatDateRange(selectedBooking)}</p>
            <p style={{ margin: 0, color: brand.subtleText, textTransform: 'capitalize' }}>
              Status: {bookingStatusLabel(selectedBooking.status)}
            </p>
            {selectedBooking.notes && (
              <p style={{ margin: '8px 0 0', color: brand.subtleText }}>{selectedBooking.notes}</p>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {bookingAction.error && (
                <span style={{ color: '#b91c1c', fontWeight: 700, marginRight: 'auto' }}>
                  {bookingAction.error}
                </span>
              )}
              <button
                type="button"
                onClick={cancelBooking}
                disabled={bookingAction.cancelling}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: bookingAction.cancelling ? brand.primarySoft : '#ef4444',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: bookingAction.cancelling ? 'not-allowed' : 'pointer',
                }}
              >
                {bookingAction.cancelling ? 'Cancelling…' : 'Cancel booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
