import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

type InvoiceStatus = 'draft' | 'issued' | 'open' | 'paid' | 'overdue' | 'cancelled';
type PaymentStatus = 'unpaid' | 'partially_paid' | 'active' | 'open' | 'completed' | 'paid' | 'failed' | string;

type InvoiceRow = {
  id: string;
  invoice_number: string;
  amount_cents: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string | null;
  issued_at: string;
};

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

type ClientRow = {
  id: string;
  full_name: string;
};

type DogRow = {
  id: string;
  name: string;
  client_id: string;
};

type MerchantTransactionRow = {
  id: string;
  state?: string;
  status?: string;
  type?: string;
  amount?: number;
  outstanding_amount?: number;
  currency?: string;
  created_at?: string;
  order_id?: string;
  customer_name?: string;
  customer?: { name?: string };
  description?: string;
  metadata?: Record<string, any>;
};

const money = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

function formatAmount(amountCents: number): string {
  return money.format(amountCents / 100);
}

export function AdminInvoicesScreen(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLinkRow[]>([]);
  const [merchantTransactions, setMerchantTransactions] = useState<MerchantTransactionRow[]>([]);
  const [merchantError, setMerchantError] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [dogs, setDogs] = useState<DogRow[]>([]);

  const fetchData = useCallback(async () => {
    setError(null);
    setMerchantError(null);
    if (!env.vercelBackendUrl) {
      setMerchantTransactions([]);
      setMerchantError('Missing backend URL for merchant fallback.');
    } else {
      try {
        const merchantResponse = await fetch(`${env.vercelBackendUrl}/api/revolut/merchant/transactions?count=50`);
        const merchantData = await merchantResponse.json();
        if (!merchantResponse.ok) {
          setMerchantError(merchantData?.error ?? 'Failed to load Revolut merchant transactions.');
          setMerchantTransactions([]);
        } else {
          const rows = Array.isArray(merchantData)
            ? merchantData
            : Array.isArray(merchantData?.orders)
              ? merchantData.orders
              : Array.isArray(merchantData?.transactions)
                ? merchantData.transactions
                : Array.isArray(merchantData?.data)
                  ? merchantData.data
                  : Array.isArray(merchantData?.items)
                    ? merchantData.items
                    : [];
          const normalizedRows = (rows as MerchantTransactionRow[]).map((row) => ({
            ...row,
            order_id: row.order_id ?? row.id,
            amount: typeof row.outstanding_amount === 'number' ? row.outstanding_amount : row.amount,
            status: row.status ?? row.state
          }));
          setMerchantTransactions(normalizedRows);
        }
      } catch (merchantFetchError: any) {
        setMerchantTransactions([]);
        setMerchantError(merchantFetchError?.message ?? 'Failed to load Revolut merchant transactions.');
      }
    }

    const [invoiceResult, linksResult, clientResult, dogResult] = await Promise.all([
      supabase
        .from('invoices')
        .select('id, invoice_number, amount_cents, currency, status, due_date, issued_at')
        .in('status', ['draft', 'issued', 'open', 'overdue', 'pending'])
        .order('issued_at', { ascending: false }),
      supabase
        .from('payment_links')
        .select('id, invoice_id, provider, provider_reference, url, status, expires_at, created_at')
        .in('status', ['unpaid', 'partially_paid', 'active', 'open', 'pending'])
        .order('created_at', { ascending: false }),
      supabase
        .from('clients')
        .select('id, full_name')
        .order('full_name', { ascending: true }),
      supabase
        .from('dogs')
        .select('id, name, client_id')
        .order('name', { ascending: true })
    ]);
    if (invoiceResult.error) throw new Error(invoiceResult.error.message);
    if (linksResult.error) throw new Error(linksResult.error.message);
    if (clientResult.error) throw new Error(clientResult.error.message);
    if (dogResult.error) throw new Error(dogResult.error.message);

    setInvoices((invoiceResult.data ?? []) as InvoiceRow[]);
    setPaymentLinks((linksResult.data ?? []) as PaymentLinkRow[]);
    setClients((clientResult.data ?? []) as ClientRow[]);
    setDogs((dogResult.data ?? []) as DogRow[]);
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await fetchData();
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Failed to load pending invoice data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  const linkCountByInvoice = useMemo(() => {
    const map = new Map<string, number>();
    paymentLinks.forEach((link) => map.set(link.invoice_id, (map.get(link.invoice_id) ?? 0) + 1));
    return map;
  }, [paymentLinks]);

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId]
  );

  const selectedInvoiceLinks = useMemo(() => {
    if (!selectedInvoice) return [];
    return paymentLinks.filter((link) => link.invoice_id === selectedInvoice.id);
  }, [paymentLinks, selectedInvoice]);

  const totals = useMemo(() => {
    const pendingInvoiceCents = invoices.reduce((sum, invoice) => sum + invoice.amount_cents, 0);
    const now = new Date();
    const overdueCount = invoices.filter((invoice) => {
      if (invoice.status === 'overdue') return true;
      if (!invoice.due_date) return false;
      return new Date(invoice.due_date) < now;
    }).length;
    return { pendingInvoiceCents, overdueCount };
  }, [invoices]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to refresh pending invoice data.');
    } finally {
      setRefreshing(false);
    }
  };

  const revolutPaymentRequests = useMemo(() => merchantTransactions.filter((tx) => (tx.type ?? '').toUpperCase() === 'PAYMENT_REQUEST'), [merchantTransactions]);
  const lower = (value?: string | null) => (value ?? '').trim().toLowerCase();
  const findCustomerName = (tx: MerchantTransactionRow): string => {
    const candidate = lower(
      tx.customer_name
      ?? tx.customer?.name
      ?? (typeof tx.metadata?.customer_name === 'string' ? tx.metadata.customer_name : '')
      ?? (typeof tx.metadata?.client_name === 'string' ? tx.metadata.client_name : '')
    );
    if (candidate) {
      const match = clients.find((client) => lower(client.full_name) === candidate);
      if (match) return match.full_name;
    }
    const desc = lower(tx.description);
    const partial = clients.find((client) => desc.includes(lower(client.full_name)));
    return partial?.full_name ?? (candidate ? (tx.customer_name ?? tx.customer?.name ?? 'Unknown customer') : 'Unknown customer');
  };
  const findDogNames = (tx: MerchantTransactionRow, resolvedCustomerName: string): string => {
    const explicitDogNames = Array.isArray(tx.metadata?.dog_names)
      ? tx.metadata?.dog_names
      : typeof tx.metadata?.dog_names === 'string'
        ? tx.metadata.dog_names.split(',').map((name: string) => name.trim()).filter(Boolean)
        : [];
    if (explicitDogNames.length > 0) {
      const canonical = explicitDogNames.map((name: string) => {
        const match = dogs.find((dog) => lower(dog.name) === lower(name));
        return match?.name ?? name;
      });
      return canonical.join(', ');
    }
    const customer = clients.find((client) => lower(client.full_name) === lower(resolvedCustomerName));
    if (customer) {
      const customerDogs = dogs.filter((dog) => dog.client_id === customer.id).map((dog) => dog.name);
      if (customerDogs.length > 0) return customerDogs.join(', ');
    }
    const desc = lower(tx.description);
    const descMatches = dogs.filter((dog) => desc.includes(lower(dog.name))).map((dog) => dog.name);
    return descMatches.length > 0 ? descMatches.join(', ') : '—';
  };

  return (
    <ScreenContainer title="Admin Invoices & Pending Payments">
      <View style={styles.summaryCard}>
        <Text style={styles.heading}>Pending payment overview</Text>
        <Text style={styles.body}>Unpaid invoices and active payment links are shown below.</Text>
        <Text style={styles.metric}>Open invoices: {invoices.length}</Text>
        <Text style={styles.metric}>Open payment links: {paymentLinks.length}</Text>
        <Text style={styles.metric}>Merchant tx fallback: {merchantTransactions.length}</Text>
        <Text style={styles.metric}>Pending amount: {formatAmount(totals.pendingInvoiceCents)}</Text>
        <Text style={styles.metric}>Overdue invoices: {totals.overdueCount}</Text>
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>{refreshing ? 'Refreshing…' : 'Refresh'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color="#7c45f3" /><Text style={styles.body}>Loading…</Text></View>
      ) : error ? (
        <View style={styles.errorCard}><Text style={styles.errorTitle}>Could not load invoices</Text><Text style={styles.body}>{error}</Text></View>
      ) : (
        <>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Invoices sent but not paid</Text>
            {invoices.length === 0 ? <Text style={styles.body}>No pending invoices right now.</Text> : invoices.map((invoice) => {
              const isSelected = selectedInvoiceId === invoice.id;
              return (
                <Pressable key={invoice.id} onPress={() => setSelectedInvoiceId(invoice.id)} style={[styles.invoiceCard, isSelected ? styles.invoiceCardActive : null]}>
                  <View style={styles.invoiceCardTop}>
                    <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
                    <Text style={styles.invoiceStatus}>{invoice.status.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.invoiceAmount}>{formatAmount(invoice.amount_cents)}</Text>
                  <View style={styles.invoiceMetaRow}>
                    <Text style={styles.invoiceMetaLabel}>Due</Text>
                    <Text style={styles.invoiceMetaValue}>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IE') : 'No due date'}</Text>
                  </View>
                  <View style={styles.invoiceMetaRow}>
                    <Text style={styles.invoiceMetaLabel}>Open links</Text>
                    <Text style={styles.invoiceMetaValue}>{linkCountByInvoice.get(invoice.id) ?? 0}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {selectedInvoice ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Invoice details #{selectedInvoice.invoice_number}</Text>
              <View style={styles.detailsCard}>
                <Text style={styles.body}>Status: {selectedInvoice.status.toUpperCase()}</Text>
                <Text style={styles.body}>Amount: {formatAmount(selectedInvoice.amount_cents)}</Text>
                <Text style={styles.body}>Issued: {new Date(selectedInvoice.issued_at).toLocaleString('en-IE')}</Text>
                <Text style={styles.body}>Due: {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('en-IE') : 'No due date'}</Text>
                <Text style={styles.body}>Invoice ID: {selectedInvoice.id}</Text>
                <Text style={styles.detailsSubTitle}>Related payment links</Text>
                {selectedInvoiceLinks.length === 0 ? (
                  <Text style={styles.body}>No active payment links for this invoice.</Text>
                ) : (
                  selectedInvoiceLinks.map((link) => (
                    <View key={link.id} style={styles.detailsRow}>
                      <Text style={styles.rowTitle}>{link.provider.toUpperCase()} • {link.status.toUpperCase()}</Text>
                      <Text style={styles.body}>Reference: {link.provider_reference ?? '—'}</Text>
                      <Text style={styles.body}>Expires: {link.expires_at ? new Date(link.expires_at).toLocaleString('en-IE') : 'No expiry'}</Text>
                      <Text style={styles.body}>URL: {link.url}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          ) : null}

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Payment links not paid yet</Text>
            {paymentLinks.length === 0 ? <Text style={styles.body}>No pending payment links right now.</Text> : paymentLinks.map((link) => (
              <View key={link.id} style={styles.row}>
                <Text style={styles.rowTitle}>{link.provider.toUpperCase()} • {link.status.toUpperCase()}</Text>
                <Text style={styles.body}>Invoice ID: {link.invoice_id}</Text>
                <Text style={styles.body}>Reference: {link.provider_reference ?? '—'}</Text>
                <Text style={styles.body}>Expires: {link.expires_at ? new Date(link.expires_at).toLocaleString('en-IE') : 'No expiry'}</Text>
              </View>
            ))}
          </View>

          {invoices.length === 0 && merchantError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Merchant fallback unavailable</Text>
              <Text style={styles.body}>{merchantError}</Text>
            </View>
          ) : null}

          {revolutPaymentRequests.length > 0 ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Revolut payment requests</Text>
              {revolutPaymentRequests.map((tx) => {
                const status = (tx.state ?? tx.status ?? 'unknown').toLowerCase();
                const completed = status === 'completed';
                const badgeLabel = completed ? 'Completed' : 'Pending';
                const customerName = findCustomerName(tx);
                const dogNames = findDogNames(tx, customerName);
                return (
                  <View key={tx.id} style={styles.revolutCard}>
                    <View style={styles.revolutHeader}>
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkMark}>{completed ? '✓' : '⌛'}</Text>
                      </View>
                      <Text style={styles.revolutStatusTitle}>{(completed ? 'COMPLETED' : 'PENDING')}</Text>
                      <View style={[styles.statusPill, completed ? styles.statusPillDone : styles.statusPillPending]}>
                        <Text style={[styles.statusPillText, completed ? styles.statusPillTextDone : styles.statusPillTextPending]}>{badgeLabel}</Text>
                      </View>
                    </View>
                    <View style={styles.revolutInfoRow}>
                      <View style={styles.infoBlock}>
                        <Text style={styles.infoIcon}>👤</Text>
                        <View><Text style={styles.infoLabel}>Customer</Text><Text style={styles.infoValue}>{customerName}</Text></View>
                      </View>
                      <View style={styles.infoDivider} />
                      <View style={styles.infoBlock}>
                        <Text style={styles.infoIcon}>D</Text>
                        <View><Text style={styles.infoLabel}>Dog(s)</Text><Text style={styles.infoValue}>{dogNames}</Text></View>
                      </View>
                      <View style={styles.infoDivider} />
                      <View style={styles.infoBlock}>
                        <Text style={styles.infoIcon}>€</Text>
                        <View><Text style={styles.infoLabel}>Amount</Text><Text style={styles.infoValue}>{typeof tx.amount === 'number' ? money.format(tx.amount / 100) : '—'} {tx.currency ?? 'EUR'}</Text></View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {invoices.length === 0 && merchantTransactions.length > 0 ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Revolut merchant transactions (fallback)</Text>
              <Text style={styles.body}>Supabase invoices are empty, so showing live merchant transactions instead.</Text>
              {merchantTransactions.map((tx) => (
                <View key={tx.id} style={styles.row}>
                  <Text style={styles.rowTitle}>{(tx.state ?? tx.status ?? 'unknown').toUpperCase()} • {(tx.type ?? 'transaction').toUpperCase()}</Text>
                  <Text style={styles.body}>Amount: {typeof tx.amount === 'number' ? money.format(tx.amount / 100) : '—'} {tx.currency ?? ''}</Text>
                  <Text style={styles.body}>Order: {tx.order_id ?? '—'}</Text>
                  <Text style={styles.body}>Created: {tx.created_at ? new Date(tx.created_at).toLocaleString('en-IE') : '—'}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: { borderRadius: 14, padding: 14, backgroundColor: '#120d23', borderWidth: 1, borderColor: '#302451' },
  heading: { color: '#f4f2ff', fontWeight: '700', fontSize: 18, marginBottom: 6 },
  body: { color: '#c9c5d8', fontSize: 14, lineHeight: 20 },
  metric: { color: '#f4f2ff', fontSize: 14, marginTop: 6 },
  refreshButton: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#7c45f3' },
  refreshText: { color: '#f4f2ff', fontWeight: '600' },
  centered: { gap: 10, alignItems: 'center', paddingVertical: 20 },
  errorCard: { borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#7a2f4e', backgroundColor: '#2a1320' },
  errorTitle: { color: '#ffd3e2', fontWeight: '700', marginBottom: 6 },
  sectionCard: { borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#302451', backgroundColor: '#120d23' },
  sectionTitle: { color: '#f4f2ff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { borderTopWidth: 1, borderTopColor: '#302451', paddingTop: 8, marginTop: 8 },
  rowTitle: { color: '#f4f2ff', fontWeight: '600', marginBottom: 4 },
  invoiceCard: {
    backgroundColor: '#17112b',
    borderWidth: 1,
    borderColor: '#2f2550',
    borderRadius: 12,
    padding: 12,
    marginTop: 10
  },
  invoiceCardActive: {
    borderColor: '#7c45f3',
    backgroundColor: '#20163b'
  },
  invoiceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceNumber: { color: '#f4f2ff', fontWeight: '700', fontSize: 15 },
  invoiceStatus: { color: '#cfc6ff', fontSize: 12, fontWeight: '700' },
  invoiceAmount: { color: '#ffffff', fontWeight: '700', fontSize: 24, marginTop: 6, marginBottom: 8 },
  invoiceMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  invoiceMetaLabel: { color: '#a79fc3', fontSize: 13 },
  invoiceMetaValue: { color: '#ece8ff', fontSize: 13, fontWeight: '600' },
  detailsCard: { borderTopWidth: 1, borderTopColor: '#302451', paddingTop: 10 },
  detailsSubTitle: { color: '#f4f2ff', fontWeight: '700', marginTop: 10, marginBottom: 6 },
  detailsRow: { borderTopWidth: 1, borderTopColor: '#302451', marginTop: 8, paddingTop: 8 },
  revolutCard: { marginTop: 10, borderWidth: 1, borderColor: '#3e2d75', borderRadius: 20, padding: 14, backgroundColor: '#070822' },
  revolutHeader: { flexDirection: 'row', alignItems: 'center' },
  checkCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#4dd3a5', alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#4dd3a5', fontSize: 20, fontWeight: '700' },
  revolutStatusTitle: { color: '#f2f3ff', marginLeft: 10, fontWeight: '800', fontSize: 16, letterSpacing: 0.8 },
  statusPill: { marginLeft: 'auto', borderRadius: 16, paddingVertical: 7, paddingHorizontal: 14 },
  statusPillDone: { backgroundColor: '#143c35' },
  statusPillPending: { backgroundColor: '#49361a' },
  statusPillText: { fontSize: 13, fontWeight: '700' },
  statusPillTextDone: { color: '#62e1b8' },
  statusPillTextPending: { color: '#f5d78e' },
  revolutInfoRow: { marginTop: 12, flexDirection: 'row', alignItems: 'stretch' },
  infoBlock: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoIcon: { color: '#ad8aff', fontSize: 20, minWidth: 18, textAlign: 'center' },
  infoLabel: { color: '#aaa3d5', fontSize: 10 },
  infoValue: { color: '#f2f3ff', fontSize: 11, fontWeight: '700' },
  infoDivider: { width: 1, backgroundColor: '#35285f', marginHorizontal: 10 }
});
