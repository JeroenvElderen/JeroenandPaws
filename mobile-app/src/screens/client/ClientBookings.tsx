import React, { useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { supabase } from '@/lib/supabase';

type Booking = {
  id: string;
  title: string | null;
  service_name: string;
  starts_at: string;
  ends_at: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  dog_names: string[];
};

export function ClientBookingsScreen(): React.ReactElement {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadBookings(): Promise<void> {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('id, title, service_name, starts_at, ends_at, status, dog_names')
      .order('starts_at', { ascending: true })
      .limit(100);
    setBookings((data ?? []) as Booking[]);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const grouped = useMemo(() => {
    return bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
      const day = booking.starts_at.slice(0, 10);
      acc[day] = acc[day] ?? [];
      acc[day].push(booking);
      return acc;
    }, {});
  }, [bookings]);

  return (
    <ScreenContainer title="Client Bookings Calendar">
      <Text style={styles.bodyText}>This calendar updates from Outlook. Please use Outlook to add, cancel, or reschedule bookings.</Text>
      <Button title={loading ? 'Loading…' : 'Refresh'} onPress={loadBookings} />

      {Object.entries(grouped).map(([day, dayBookings]) => (
        <View key={day} style={styles.dayCard}>
          <Text style={styles.dayTitle}>{day}</Text>
          {dayBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>{booking.title ?? booking.service_name}</Text>
              <Text style={styles.bodyText}>{booking.dog_names?.join(' & ') || 'No dogs parsed'}</Text>
              <Text style={styles.bodyText}>{new Date(booking.starts_at).toLocaleTimeString()} - {new Date(booking.ends_at).toLocaleTimeString()}</Text>
              <Text style={styles.status}>{booking.status}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bodyText: { color: '#c9c5d8', fontSize: 14, lineHeight: 20 },
  dayCard: { backgroundColor: '#140f28', padding: 12, borderRadius: 12, gap: 8 },
  dayTitle: { color: '#f4f2ff', fontSize: 16, fontWeight: '700' },
  bookingCard: { backgroundColor: '#0f3d1f', borderRadius: 10, padding: 10, gap: 6 },
  bookingTitle: { color: '#aef9be', fontSize: 16, fontWeight: '700' },
  status: { color: '#d7d0ff', textTransform: 'capitalize' }
});
