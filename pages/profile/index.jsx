import React, { useMemo, useState } from 'react';

const pillStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#1f2937',
  fontWeight: 600,
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
};

const SectionCard = ({ title, description, children, accent }) => (
  <section
    style={{
      background: '#ffffff',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
      border: `1px solid ${accent || '#e5e7eb'}`,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: '1.4rem' }}>{title}</h2>
        {description && <p style={{ margin: '6px 0 16px', color: '#6b7280' }}>{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const emptyStateStyle = {
  background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
  border: '1px dashed #d1d5db',
  borderRadius: '16px',
  padding: '16px',
  color: '#6b7280',
  textAlign: 'center',
};

const ProfilePage = () => {
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newPet, setNewPet] = useState({ name: '', breed: '', notes: '' });

  const loadProfile = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/clients?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Could not load profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const createPet = async () => {
    try {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail: email, ...newPet }),
      });

      if (!response.ok) {
        throw new Error('Could not save pet');
      }

      setNewPet({ name: '', breed: '', notes: '' });
      await loadProfile();
    } catch (err) {
      setError(err.message || 'Unable to save pet');
    }
  };

  const hasPets = useMemo(() => profile?.pets?.length > 0, [profile]);
  const hasBookings = useMemo(() => profile?.bookings?.length > 0, [profile]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 20% 20%, rgba(94, 234, 212, 0.18), transparent 25%),\n          radial-gradient(circle at 80% 0%, rgba(129, 140, 248, 0.18), transparent 25%),\n          #f8fafc',
        padding: '32px 16px 48px',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <header
          style={{
            background: 'linear-gradient(120deg, #1e293b, #111827)',
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
                'radial-gradient(circle at 20% 20%, rgba(94, 234, 212, 0.25), transparent 30%),\n                 radial-gradient(circle at 80% 10%, rgba(129, 140, 248, 0.25), transparent 35%)',
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
              <h1 style={{ margin: '12px 0 8px', fontSize: '2.4rem' }}>Profile & Booking Center</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', fontSize: '1rem', lineHeight: 1.6 }}>
                View your contact details, manage pets, and keep track of bookings—all in one polished dashboard.
              </p>
            </div>
            <div
              style={{
                flex: '1 1 280px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '18px',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.18) inset',
              }}
            >
              <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Access your profile</p>
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
                <button
                  type="button"
                  onClick={loadProfile}
                  disabled={loading || !email}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#22c55e',
                    color: '#0f172a',
                    fontWeight: 700,
                    cursor: loading || !email ? 'not-allowed' : 'pointer',
                    boxShadow: '0 12px 30px rgba(34, 197, 94, 0.35)',
                  }}
                >
                  {loading ? 'Loading…' : 'View profile'}
                </button>
              </div>
            </div>
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
                title="Client overview"
                description="Quick details to confirm you're in the right place."
                accent="#e0f2fe"
              >
                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    alignItems: 'stretch',
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #e0f2fe, #dbeafe)',
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    <p style={{ margin: '0 0 6px', color: '#1d4ed8', fontWeight: 700 }}>Name</p>
                    <p style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
                      {profile.client.full_name || 'Unnamed client'}
                    </p>
                  </div>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ecfdf3, #dcfce7)',
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <p style={{ margin: '0 0 6px', color: '#15803d', fontWeight: 700 }}>Email</p>
                    <p style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 600 }}>{profile.client.email}</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Your pets"
                description="Keep pet details handy for quick bookings and personalized care."
                accent="#f3e8ff"
              >
                {hasPets ? (
                  <div
                    style={{
                      display: 'grid',
                      gap: '12px',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    }}
                  >
                    {profile.pets.map((pet) => (
                      <div
                        key={pet.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '16px',
                          padding: '16px',
                          background: 'linear-gradient(180deg, #f8fafc, #ffffff)',
                          boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>{pet.name}</div>
                          {pet.breed && (
                            <span
                              style={{
                                background: '#eef2ff',
                                color: '#4338ca',
                                padding: '6px 10px',
                                borderRadius: '999px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                              }}
                            >
                              {pet.breed}
                            </span>
                          )}
                        </div>
                        {pet.notes ? (
                          <p style={{ margin: 0, color: '#4b5563' }}>{pet.notes}</p>
                        ) : (
                          <p style={{ margin: 0, color: '#94a3b8' }}>No notes added yet.</p>
                        )}
                      </div>
                    ))}
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
                    background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.12), rgba(236, 72, 153, 0.08))',
                    border: '1px solid rgba(129, 140, 248, 0.25)',
                  }}
                >
                  <h3 style={{ margin: '0 0 10px', color: '#111827' }}>Add a new pet</h3>
                  <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ color: '#475569', fontWeight: 600 }}>Name</label>
                      <input
                        type="text"
                        placeholder="Luna"
                        value={newPet.name}
                        onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          background: '#fff',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ color: '#475569', fontWeight: 600 }}>Breed</label>
                      <input
                        type="text"
                        placeholder="Golden Retriever"
                        value={newPet.breed}
                        onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          background: '#fff',
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ color: '#475569', fontWeight: 600 }}>Notes</label>
                      <textarea
                        placeholder="Feeding instructions, personality notes, medication..."
                        value={newPet.notes}
                        onChange={(e) => setNewPet({ ...newPet, notes: e.target.value })}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          background: '#fff',
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
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 14px 40px rgba(34, 197, 94, 0.35)',
                      }}
                    >
                      Save pet
                    </button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Bookings"
                description="Upcoming and past appointments at a glance."
                accent="#fee2e2"
              >
                {hasBookings ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                    {profile.bookings.map((booking) => (
                      <li
                        key={booking.id}
                        style={{
                          background: 'linear-gradient(180deg, #fff7ed, #ffffff)',
                          border: '1px solid #fed7aa',
                          borderRadius: '16px',
                          padding: '14px',
                          boxShadow: '0 12px 28px rgba(251, 146, 60, 0.12)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div>
                            <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#c2410c' }}>
                              {booking.service_title || booking?.services_catalog?.title}
                            </p>
                            <p style={{ margin: 0, color: '#0f172a', fontWeight: 600 }}>
                              {new Date(booking.start_at).toLocaleString()} → {new Date(booking.end_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <span
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '6px 12px',
                              borderRadius: '999px',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              border: '1px solid #fcd34d',
                            }}
                          >
                            {new Date(booking.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {booking.notes && <p style={{ margin: '8px 0 0', color: '#4b5563' }}>{booking.notes}</p>}
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
            </>
          ) : (
            <SectionCard
              title="Welcome back"
              description="Enter your email above to unlock your personalized client hub."
              accent="#e5e7eb"
            >
              <div style={{ ...emptyStateStyle, background: 'linear-gradient(135deg, #eef2ff, #f8fafc)' }}>
                <p style={{ margin: 0 }}>
                  <strong>Tip:</strong> Use the same email you used during booking to instantly load your profile.
                </p>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;