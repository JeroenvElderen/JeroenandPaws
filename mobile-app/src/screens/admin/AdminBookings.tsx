import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { supabase } from '@/lib/supabase';

type Booking = {
  id: string;
  service_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
  title: string | null;
  source: 'manual' | 'outlook';
};

export function AdminBookingsScreen(): React.ReactElement {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(): Promise<void> {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('id, service_name, starts_at, ends_at, status, title, source')
      .order('starts_at', { ascending: true })
      .limit(100);
    setBookings((data ?? []) as Booking[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ScreenContainer title="Admin Bookings Calendar">
      <Text style={styles.bodyText}>
        Outlook is the source of truth for add/reschedule/cancel. This screen mirrors synced bookings.
      </Text>
      <Button title={loading ? 'Loading…' : 'Refresh'} onPress={load} />
      {bookings.map((booking) => (
        <View key={booking.id} style={styles.bookingCard}>
          <Text style={styles.title}>{booking.title ?? booking.service_name}</Text>
          <Text style={styles.bodyText}>{new Date(booking.starts_at).toLocaleString()} - {new Date(booking.ends_at).toLocaleTimeString()}</Text>
          <Text style={styles.meta}>Status: {booking.status}</Text>
          <Text style={styles.meta}>Source: {booking.source}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bodyText: { color: '#c9c5d8', fontSize: 14 },
  bookingCard: { backgroundColor: '#1f1535', borderRadius: 12, padding: 12, gap: 6 },
  title: { color: '#f4f2ff', fontWeight: '700', fontSize: 16 },
  meta: { color: '#d7d0ff', fontSize: 13 }
});
