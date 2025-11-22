import React, { useState } from 'react';

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

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px' }}>
      <h1>Your profile & pets</h1>
      <p style={{ color: '#555' }}>
        Enter the email you used when booking to view your profile, pets, and recent bookings.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="button" onClick={loadProfile} disabled={loading}>
          {loading ? 'Loading…' : 'Load profile'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {profile && (
        <>
          <section style={{ marginTop: '24px' }}>
            <h2>Client details</h2>
            <p>
              <strong>{profile.client.full_name || 'Unnamed client'}</strong>
            </p>
            <p>{profile.client.email}</p>
          </section>

          <section style={{ marginTop: '24px' }}>
            <h2>Pets</h2>
            {profile.pets.length === 0 ? (
              <p style={{ color: '#666' }}>No pets saved yet.</p>
            ) : (
              <ul>
                {profile.pets.map((pet) => (
                  <li key={pet.id}>
                    <strong>{pet.name}</strong>
                    {pet.breed ? ` • ${pet.breed}` : ''}
                    {pet.notes ? ` — ${pet.notes}` : ''}
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: '12px' }}>
              <h3>Add pet</h3>
              <div style={{ display: 'grid', gap: '8px', maxWidth: '420px' }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Breed"
                  value={newPet.breed}
                  onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                />
                <textarea
                  placeholder="Notes"
                  value={newPet.notes}
                  onChange={(e) => setNewPet({ ...newPet, notes: e.target.value })}
                />
                <button type="button" onClick={createPet}>Save pet</button>
              </div>
            </div>
          </section>

          <section style={{ marginTop: '24px' }}>
            <h2>Bookings</h2>
            {profile.bookings.length === 0 ? (
              <p style={{ color: '#666' }}>No bookings yet.</p>
            ) : (
              <ul style={{ paddingLeft: '16px' }}>
                {profile.bookings.map((booking) => (
                  <li key={booking.id} style={{ marginBottom: '8px' }}>
                    <strong>{booking.service_title || booking?.services_catalog?.title}</strong>
                    <div style={{ color: '#555' }}>
                      {new Date(booking.start_at).toLocaleString()} →{' '}
                      {new Date(booking.end_at).toLocaleTimeString()}
                    </div>
                    {booking.notes && <div style={{ color: '#777' }}>{booking.notes}</div>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default ProfilePage;