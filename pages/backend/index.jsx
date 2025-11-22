import React, { useEffect, useState } from 'react';

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'jeroen@jeroenandpaws.com';

const BackendDashboard = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [serviceDraft, setServiceDraft] = useState({ title: '', price: '', duration_minutes: 60 });
  const [error, setError] = useState('');

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data.services || []);
    } catch (err) {
      setError('Could not load services');
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await fetch('/api/bookings', {
        headers: { 'x-admin-email': adminEmail },
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError('Could not load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const saveService = async (service) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({ service }),
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      await fetchServices();
      setServiceDraft({ title: '', price: '', duration_minutes: 60 });
    } catch (err) {
      setError('Could not save service');
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      <h1>Backend controls</h1>
      <p>Signed in as: {adminEmail}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Services</h2>
          <button onClick={fetchServices} disabled={loadingServices}>
            {loadingServices ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {services.map((service) => (
            <div key={service.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <strong>{service.title}</strong>
                <span style={{ color: '#666' }}>{service.price}</span>
                <span style={{ color: '#666' }}>{service.duration_minutes} min</span>
              </div>
              <p style={{ marginTop: '8px', color: '#444' }}>{service.description}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <h3>Add or update service</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            <input
              type="text"
              placeholder="Title"
              value={serviceDraft.title}
              onChange={(e) => setServiceDraft({ ...serviceDraft, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Slug (optional)"
              value={serviceDraft.slug || ''}
              onChange={(e) => setServiceDraft({ ...serviceDraft, slug: e.target.value })}
            />
            <input
              type="text"
              placeholder="Price"
              value={serviceDraft.price}
              onChange={(e) => setServiceDraft({ ...serviceDraft, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Duration minutes"
              value={serviceDraft.duration_minutes}
              onChange={(e) =>
                setServiceDraft({ ...serviceDraft, duration_minutes: Number(e.target.value) })
              }
            />
            <textarea
              placeholder="Description"
              value={serviceDraft.description || ''}
              onChange={(e) => setServiceDraft({ ...serviceDraft, description: e.target.value })}
            />
            <button type="button" onClick={() => saveService(serviceDraft)}>Save service</button>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Recent bookings</h2>
          <button onClick={fetchBookings} disabled={loadingBookings}>
            {loadingBookings ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {bookings.map((booking) => (
            <div key={booking.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{booking.service_title || booking?.services_catalog?.title}</strong>
                  <p style={{ margin: '4px 0', color: '#444' }}>{booking.clients?.full_name}</p>
                </div>
                <span style={{ color: '#666' }}>
                  {new Date(booking.start_at).toLocaleString()} →{' '}
                  {new Date(booking.end_at).toLocaleTimeString()}
                </span>
              </div>
              {booking.notes && <p style={{ color: '#555' }}>{booking.notes}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default BackendDashboard;