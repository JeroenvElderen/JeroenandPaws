import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { supabase } from '@/lib/supabase';

type PaymentStatus = 'unpaid' | 'partially_paid' | 'active' | 'open' | 'completed' | 'paid' | 'failed' | string;

type PaymentLinkRow = {
  id: string;
  invoice_id: string;
  provider: string;
  provider_reference: string | null;
  url: string;
  status: PaymentStatus;
  expires_at: string | null;
  created_at: string;
};

type InvoiceLookupRow = {
  id: string;
  invoice_number: string;
  due_date: string | null;
  booking_id: string | null;
};

type BookingLookupRow = {
  id: string;
  title: string | null;
  service_name: string | null;
  dog_names: string[];
  client_id: string;
};

type ClientLookupRow = {
  id: string;
  full_name: string;
};

export function AdminPaymentLinksScreen(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<PaymentLinkRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'partially_paid' | 'paid' | 'failed'>('open');
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [invoiceLookup, setInvoiceLookup] = useState<Record<string, InvoiceLookupRow>>({});
  const [bookingLookup, setBookingLookup] = useState<Record<string, BookingLookupRow>>({});
  const [clientLookup, setClientLookup] = useState<Record<string, ClientLookupRow>>({});

  const fetchLinks = useCallback(async () => {
    setError(null);
    const { data, error: linksError } = await supabase
      .from('payment_links')
      .select('id, invoice_id, provider, provider_reference, url, status, expires_at, created_at')
      .in('status', ['unpaid', 'partially_paid', 'active', 'open', 'pending', 'completed', 'paid', 'failed'])
      .order('created_at', { ascending: false });
    if (linksError) throw new Error(linksError.message);
    const nextLinks = (data ?? []) as PaymentLinkRow[];
    setLinks(nextLinks);

    const invoiceIds = Array.from(new Set(nextLinks.map((link) => link.invoice_id).filter(Boolean)));
    if (invoiceIds.length === 0) {
      setInvoiceLookup({});
      setBookingLookup({});
      setClientLookup({});
      return;
    }

    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, invoice_number, due_date, booking_id')
      .in('id', invoiceIds);
    if (invoicesError) throw new Error(invoicesError.message);
    const invoices = (invoicesData ?? []) as InvoiceLookupRow[];
    setInvoiceLookup(Object.fromEntries(invoices.map((invoice) => [invoice.id, invoice])));

    const bookingIds = Array.from(new Set(invoices.map((invoice) => invoice.booking_id).filter(Boolean)));
    if (bookingIds.length === 0) {
      setBookingLookup({});
      setClientLookup({});
      return;
    }
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, title, service_name, dog_names, client_id')
      .in('id', bookingIds as string[]);
    if (bookingsError) throw new Error(bookingsError.message);
    const bookings = (bookingsData ?? []) as BookingLookupRow[];
    setBookingLookup(Object.fromEntries(bookings.map((booking) => [booking.id, booking])));

    const clientIds = Array.from(new Set(bookings.map((booking) => booking.client_id).filter(Boolean)));
    if (clientIds.length === 0) {
      setClientLookup({});
      return;
    }

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('id, full_name')
      .in('id', clientIds);
    if (clientsError) throw new Error(clientsError.message);
    const clients = (clientsData ?? []) as ClientLookupRow[];
    setClientLookup(Object.fromEntries(clients.map((client) => [client.id, client])));
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await fetchLinks();
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load payment links.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [fetchLinks]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchLinks();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to refresh payment links.');
    } finally {
      setRefreshing(false);
    }
  };

  const groupedStatus = (status: string): 'open' | 'partially_paid' | 'paid' | 'failed' => {
    const normalized = status.toLowerCase();
    if (normalized === 'partially_paid') return 'partially_paid';
    if (['paid', 'completed'].includes(normalized)) return 'paid';
    if (['failed', 'cancelled'].includes(normalized)) return 'failed';
    return 'open';
  };

  const linkStateGroup = (link: PaymentLinkRow): 'overdue' | 'pending' | 'completed' | 'failed' => {
    const group = groupedStatus(link.status);
    if (group === 'paid') return 'completed';
    if (group === 'failed') return 'failed';
    if (group === 'partially_paid') return 'pending';
    const invoiceDueDate = invoiceLookup[link.invoice_id]?.due_date;
    const candidateDue = link.expires_at ?? invoiceDueDate;
    if (candidateDue && new Date(candidateDue).getTime() < Date.now()) return 'overdue';
    return 'pending';
  };

  const sortedLinks = useMemo(() => {
    const orderRank: Record<'overdue' | 'pending' | 'completed' | 'failed', number> = {
      overdue: 0,
      pending: 1,
      completed: 2,
      failed: 3
    };
    return [...links].sort((a, b) => {
      const rankDelta = orderRank[linkStateGroup(a)] - orderRank[linkStateGroup(b)];
      if (rankDelta !== 0) return rankDelta;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [links, invoiceLookup]);

  const filteredLinks = useMemo(() => {
    const source = sortedLinks;
    if (statusFilter === 'all') return source;
    if (statusFilter === 'paid') return source.filter((link) => linkStateGroup(link) === 'completed');
    if (statusFilter === 'failed') return source.filter((link) => linkStateGroup(link) === 'failed');
    return source.filter((link) => {
      const state = linkStateGroup(link);
      if (statusFilter === 'open') return state === 'pending' || state === 'overdue';
      return groupedStatus(link.status) === statusFilter;
    });
  }, [sortedLinks, links, statusFilter, invoiceLookup]);

  const selectedLink = useMemo(() => links.find((link) => link.id === selectedLinkId) ?? null, [links, selectedLinkId]);

  return (
    <ScreenContainer title="Admin Payment Links">
      <View style={styles.summaryCard}>
        <Text style={styles.heading}>Payment links</Text>
        <Text style={styles.body}>Track open and paid links in invoice-style cards.</Text>
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>{refreshing ? 'Refreshing…' : 'Refresh'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color="#7c45f3" /><Text style={styles.body}>Loading…</Text></View>
      ) : error ? (
        <View style={styles.errorCard}><Text style={styles.errorTitle}>Could not load payment links</Text><Text style={styles.body}>{error}</Text></View>
      ) : (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Links</Text>
          <View style={styles.filterRow}>
            {[
              { key: 'open', label: 'Open' },
              { key: 'paid', label: 'Paid' },
              { key: 'failed', label: 'Failed' }
            ].map((filter) => (
              <Pressable key={filter.key} onPress={() => setStatusFilter(filter.key as any)} style={[styles.filterChip, statusFilter === filter.key ? styles.filterChipActive : null]}>
                <Text style={[styles.filterChipText, statusFilter === filter.key ? styles.filterChipTextActive : null]}>{filter.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setStatusFilter('all')} style={[styles.filterChip, statusFilter === 'all' ? styles.filterChipActive : null]}>
              <Text style={[styles.filterChipText, statusFilter === 'all' ? styles.filterChipTextActive : null]}>All</Text>
            </Pressable>
          </View>

          {filteredLinks.length === 0 ? <Text style={styles.body}>No payment links in this filter.</Text> : filteredLinks.map((link) => {
            const isSelected = selectedLinkId === link.id;
            return (
              <Pressable key={link.id} onPress={() => setSelectedLinkId(link.id)} style={[styles.invoiceCard, isSelected ? styles.invoiceCardActive : null]}>
                <View style={styles.invoiceCardTop}>
                  <Text style={styles.invoiceNumber}>
                    {bookingLookup[invoiceLookup[link.invoice_id]?.booking_id ?? '']?.title
                      ?? bookingLookup[invoiceLookup[link.invoice_id]?.booking_id ?? '']?.service_name
                      ?? `Payment link #${invoiceLookup[link.invoice_id]?.invoice_number ?? '—'}`}
                  </Text>
                </View>
                <Text style={styles.invoiceStatusDetail}>{linkStateGroup(link).toUpperCase()}</Text>
                <View style={styles.invoiceMetaRow}>
                  <Text style={styles.invoiceMetaLabel}>Client</Text>
                  <Text style={styles.invoiceMetaValue}>{clientLookup[bookingLookup[invoiceLookup[link.invoice_id]?.booking_id ?? '']?.client_id ?? '']?.full_name ?? '—'}</Text>
                </View>
                <View style={styles.invoiceMetaRow}>
                  <Text style={styles.invoiceMetaLabel}>Dog(s)</Text>
                  <Text style={styles.invoiceMetaValue}>{(bookingLookup[invoiceLookup[link.invoice_id]?.booking_id ?? '']?.dog_names ?? []).join(', ') || '—'}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {selectedLink ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment link details</Text>
          <View style={styles.detailsCard}>
            <Text style={styles.body}>Status: {selectedLink.status.toUpperCase()}</Text>
            <Text style={styles.body}>Provider: {selectedLink.provider.toUpperCase()}</Text>
            <Text style={styles.body}>Created: {new Date(selectedLink.created_at).toLocaleString('en-IE')}</Text>
            <Text style={styles.body}>Expires: {selectedLink.expires_at ? new Date(selectedLink.expires_at).toLocaleString('en-IE') : 'No expiry'}</Text>
            <Text style={styles.body}>Invoice ID: {selectedLink.invoice_id}</Text>
            <Text style={styles.body}>Invoice Number: {invoiceLookup[selectedLink.invoice_id]?.invoice_number ?? '—'}</Text>
            <Text style={styles.body}>URL: {selectedLink.url}</Text>
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: { borderRadius: 14, padding: 14, backgroundColor: '#120d23', borderWidth: 1, borderColor: '#302451' },
  heading: { color: '#f4f2ff', fontWeight: '700', fontSize: 18, marginBottom: 6 },
  body: { color: '#c9c5d8', fontSize: 14, lineHeight: 20 },
  refreshButton: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#7c45f3' },
  refreshText: { color: '#f4f2ff', fontWeight: '600' },
  centered: { gap: 10, alignItems: 'center', paddingVertical: 20 },
  errorCard: { borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#7a2f4e', backgroundColor: '#2a1320' },
  errorTitle: { color: '#ffd3e2', fontWeight: '700', marginBottom: 6 },
  sectionCard: { borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#302451', backgroundColor: '#120d23' },
  sectionTitle: { color: '#f4f2ff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  filterChip: { borderRadius: 999, borderWidth: 1, borderColor: '#4a3a74', paddingVertical: 6, paddingHorizontal: 10 },
  filterChipActive: { backgroundColor: '#7c45f3', borderColor: '#7c45f3' },
  filterChipText: { color: '#cec7eb', fontWeight: '600', fontSize: 12 },
  filterChipTextActive: { color: '#ffffff' },
  invoiceCard: { backgroundColor: '#17112b', borderWidth: 1, borderColor: '#2f2550', borderRadius: 12, padding: 12, marginTop: 10 },
  invoiceCardActive: { borderColor: '#7c45f3', backgroundColor: '#20163b' },
  invoiceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceNumber: { color: '#f4f2ff', fontWeight: '700', fontSize: 15 },
  invoiceStatus: { color: '#cfc6ff', fontSize: 12, fontWeight: '700' },
  invoiceStatusDetail: { color: '#cfc6ff', fontSize: 12, fontWeight: '700', marginTop: 6, marginBottom: 8 },
  invoiceAmount: { color: '#ffffff', fontWeight: '700', fontSize: 24, marginTop: 6, marginBottom: 8 },
  invoiceMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  invoiceMetaLabel: { color: '#a79fc3', fontSize: 13 },
  invoiceMetaValue: { color: '#ece8ff', fontSize: 13, fontWeight: '600' },
  detailsCard: { borderTopWidth: 1, borderTopColor: '#302451', paddingTop: 10 }
});