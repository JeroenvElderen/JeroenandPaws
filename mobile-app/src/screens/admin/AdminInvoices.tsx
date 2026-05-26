import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

type InvoiceStatus = 'draft' | 'issued' | 'open' | 'paid' | 'overdue' | 'cancelled';
type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'failed';

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

type MerchantTransactionRow = {
  id: string;
  state?: string;
  status?: string;
  type?: string;
  amount?: number;
  currency?: string;
  created_at?: string;
  order_id?: string;
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

  const fetchData = useCallback(async () => {
    setError(null);
    const [invoiceResult, linksResult] = await Promise.all([
      supabase
        .from('invoices')
        .select('id, invoice_number, amount_cents, currency, status, due_date, issued_at')
        .in('status', ['draft', 'issued', 'open', 'overdue'])
        .order('issued_at', { ascending: false }),
      supabase
        .from('payment_links')
        .select('id, invoice_id, provider, provider_reference, url, status, expires_at, created_at')
        .in('status', ['unpaid', 'partially_paid'])
        .order('created_at', { ascending: false })
    ]);

    if (invoiceResult.error) throw new Error(invoiceResult.error.message);
    if (linksResult.error) throw new Error(linksResult.error.message);

    setInvoices((invoiceResult.data ?? []) as InvoiceRow[]);
    setPaymentLinks((linksResult.data ?? []) as PaymentLinkRow[]);

    const shouldLoadMerchantFallback = (invoiceResult.data ?? []).length === 0;
    if (!shouldLoadMerchantFallback) {
      setMerchantTransactions([]);
      return;
    }

    if (!env.vercelBackendUrl) {
      setMerchantTransactions([]);
      return;
    }

    const merchantResponse = await fetch(`${env.vercelBackendUrl}/api/revolut/merchant/transactions?count=50`);
    const merchantData = await merchantResponse.json();
    if (!merchantResponse.ok) {
      throw new Error(merchantData?.error ?? 'Failed to load Revolut merchant transactions.');
    }

    const rows = Array.isArray(merchantData)
      ? merchantData
      : Array.isArray(merchantData?.transactions)
        ? merchantData.transactions
        : Array.isArray(merchantData?.data)
          ? merchantData.data
          : Array.isArray(merchantData?.items)
            ? merchantData.items
        : [];
    setMerchantTransactions(rows as MerchantTransactionRow[]);
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

  const totals = useMemo(() => {
    const pendingInvoiceCents = invoices.reduce((sum, invoice) => sum + invoice.amount_cents, 0);
    const overdueCount = invoices.filter((invoice) => invoice.status === 'overdue').length;
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
            {invoices.length === 0 ? <Text style={styles.body}>No pending invoices right now.</Text> : invoices.map((invoice) => (
              <View key={invoice.id} style={styles.row}>
                <Text style={styles.rowTitle}>#{invoice.invoice_number} • {invoice.status.toUpperCase()}</Text>
                <Text style={styles.body}>Amount: {formatAmount(invoice.amount_cents)}</Text>
                <Text style={styles.body}>Issued: {new Date(invoice.issued_at).toLocaleDateString('en-IE')}</Text>
                <Text style={styles.body}>Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IE') : 'No due date'}</Text>
                <Text style={styles.body}>Open links: {linkCountByInvoice.get(invoice.id) ?? 0}</Text>
              </View>
            ))}
          </View>

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
  rowTitle: { color: '#f4f2ff', fontWeight: '600', marginBottom: 4 }
});
