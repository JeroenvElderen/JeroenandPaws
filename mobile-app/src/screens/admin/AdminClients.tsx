import React, { useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { supabase } from '@/lib/supabase';

type ClientRow = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};

type ClientSnapshot = {
  client: ClientRow;
  dogsCount: number;
  upcomingBookings: number;
  openInvoices: number;
};

export function AdminClientsScreen(): React.ReactElement {
  const [clients, setClients] = useState<ClientSnapshot[]>([]);
  const [loading, setLoading] = useState(false);

  const totals = useMemo(() => {
    const totalDogs = clients.reduce((sum, item) => sum + item.dogsCount, 0);
    const totalUpcomingBookings = clients.reduce((sum, item) => sum + item.upcomingBookings, 0);
    const totalOpenInvoices = clients.reduce((sum, item) => sum + item.openInvoices, 0);

    return {
      totalClients: clients.length,
      totalDogs,
      totalUpcomingBookings,
      totalOpenInvoices
    };
  }, [clients]);

  async function load(): Promise<void> {
    setLoading(true);

    const [{ data: clientRows }, { data: dogRows }, { data: bookingRows }, { data: invoiceRows }] = await Promise.all([
      supabase.from('clients').select('id, full_name, email, created_at').order('full_name', { ascending: true }).limit(200),
      supabase.from('dogs').select('client_id'),
      supabase.from('bookings').select('client_id, starts_at, status').gte('starts_at', new Date().toISOString()),
      supabase.from('invoices').select('client_id, status').in('status', ['issued', 'overdue', 'draft'])
    ]);

    const dogCountByClient = new Map<string, number>();
    for (const dog of dogRows ?? []) {
      const clientId = dog.client_id as string;
      dogCountByClient.set(clientId, (dogCountByClient.get(clientId) ?? 0) + 1);
    }

    const bookingCountByClient = new Map<string, number>();
    for (const booking of bookingRows ?? []) {
      if (booking.status === 'cancelled' || booking.status === 'completed') continue;
      const clientId = booking.client_id as string;
      bookingCountByClient.set(clientId, (bookingCountByClient.get(clientId) ?? 0) + 1);
    }

    const openInvoiceCountByClient = new Map<string, number>();
    for (const invoice of invoiceRows ?? []) {
      const clientId = invoice.client_id as string;
      openInvoiceCountByClient.set(clientId, (openInvoiceCountByClient.get(clientId) ?? 0) + 1);
    }

    const next = (clientRows ?? []).map((client) => ({
      client: client as ClientRow,
      dogsCount: dogCountByClient.get(client.id) ?? 0,
      upcomingBookings: bookingCountByClient.get(client.id) ?? 0,
      openInvoices: openInvoiceCountByClient.get(client.id) ?? 0
    }));

    setClients(next);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ScreenContainer title="Admin Clients">
      <Text style={styles.bodyText}>Client roster and account health from secure backend data.</Text>
      <Button title={loading ? 'Loading…' : 'Refresh'} onPress={load} />

      {clients.map((entry) => (
        <View key={entry.client.id} style={styles.clientCard}>
          <Text style={styles.clientName}>{entry.client.full_name}</Text>
          <Text style={styles.email}>{entry.client.email}</Text>
          <Text style={styles.meta}>Dogs: {entry.dogsCount}</Text>
          <Text style={styles.meta}>Upcoming bookings: {entry.upcomingBookings}</Text>
          <Text style={styles.meta}>Open invoices: {entry.openInvoices}</Text>
          <Text style={styles.meta}>Joined: {new Date(entry.client.created_at).toLocaleDateString()}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bodyText: { color: '#c9c5d8', fontSize: 15, lineHeight: 22 },
  summaryCard: {
    backgroundColor: '#120d23',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 14,
    gap: 4
  },
  summaryHeading: { color: '#f4f2ff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  summaryItem: { color: '#d7d0ff', fontSize: 14 },
  clientCard: {
    backgroundColor: '#1f1535',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(124, 69, 243, 0.5)'
  },
  clientName: { color: '#f4f2ff', fontWeight: '700', fontSize: 16 },
  email: { color: '#c9c5d8', fontSize: 13, marginBottom: 3 },
  meta: { color: '#d7d0ff', fontSize: 13 }
});
