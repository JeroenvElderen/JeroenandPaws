import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { supabase } from '@/lib/supabase';

type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

type InvoiceRow = {
  amount_cents: number;
  issued_at: string;
  status: InvoiceStatus;
};

type ExpenseRow = {
  amount_cents: number;
  spent_at: string;
};

type MonthSummary = {
  monthLabel: string;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
};

const currencyFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2
});

function toCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

function monthKey(dateValue: string): string {
  const date = new Date(dateValue);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function monthLabelFromKey(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function buildMonthSummary(invoices: InvoiceRow[], expenses: ExpenseRow[]): MonthSummary[] {
  const monthlyIncome = new Map<string, number>();
  const monthlyExpenses = new Map<string, number>();

  invoices
    .filter((invoice) => invoice.status !== 'cancelled')
    .forEach((invoice) => {
      const key = monthKey(invoice.issued_at);
      monthlyIncome.set(key, (monthlyIncome.get(key) ?? 0) + invoice.amount_cents);
    });

  expenses.forEach((expense) => {
    const key = monthKey(expense.spent_at);
    monthlyExpenses.set(key, (monthlyExpenses.get(key) ?? 0) + expense.amount_cents);
  });

  const allKeys = Array.from(new Set([...monthlyIncome.keys(), ...monthlyExpenses.keys()])).sort((a, b) =>
    a < b ? 1 : -1
  );

  return allKeys.slice(0, 6).map((key) => {
    const incomeCents = monthlyIncome.get(key) ?? 0;
    const expenseCents = monthlyExpenses.get(key) ?? 0;
    return {
      monthLabel: monthLabelFromKey(key),
      incomeCents,
      expenseCents,
      netCents: incomeCents - expenseCents
    };
  });
}

export function AdminIncomeScreen(): JSX.Element {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncomeData = useCallback(async () => {
    setError(null);

    const [invoiceResult, expenseResult] = await Promise.all([
      supabase.from('invoices').select('amount_cents, issued_at, status').order('issued_at', { ascending: false }),
      supabase.from('expenses').select('amount_cents, spent_at').order('spent_at', { ascending: false })
    ]);

    if (invoiceResult.error) {
      throw new Error(invoiceResult.error.message);
    }

    if (expenseResult.error) {
      throw new Error(expenseResult.error.message);
    }

    setInvoices((invoiceResult.data ?? []) as InvoiceRow[]);
    setExpenses((expenseResult.data ?? []) as ExpenseRow[]);
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await fetchIncomeData();
      } catch (fetchError: any) {
        if (mounted) {
          setError(fetchError?.message ?? 'Failed to load income dashboard data.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [fetchIncomeData]);

  const summary = useMemo(() => {
    const totalInvoiced = invoices
      .filter((invoice) => invoice.status !== 'cancelled')
      .reduce((total, invoice) => total + invoice.amount_cents, 0);

    const totalPaid = invoices
      .filter((invoice) => invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount_cents, 0);

    const outstanding = invoices
      .filter((invoice) => invoice.status === 'issued' || invoice.status === 'overdue' || invoice.status === 'draft')
      .reduce((total, invoice) => total + invoice.amount_cents, 0);

    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount_cents, 0);

    return {
      totalInvoiced,
      totalPaid,
      outstanding,
      totalExpenses,
      net: totalPaid - totalExpenses
    };
  }, [invoices, expenses]);

  const monthlySummary = useMemo(() => buildMonthSummary(invoices, expenses), [invoices, expenses]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchIncomeData();
    } catch (refreshError: any) {
      setError(refreshError?.message ?? 'Failed to refresh income dashboard data.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenContainer title="Admin Income Dashboard">
      <View style={styles.headerCard}>
        <Text style={styles.heading}>Income & Profit Snapshot</Text>
        <Text style={styles.copy}>Track invoiced, paid, and outstanding amounts with expenses and monthly trends.</Text>
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>{refreshing ? 'Refreshing…' : 'Refresh Data'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#7c45f3" />
          <Text style={styles.helperText}>Loading dashboard data…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Could not load data</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>Total Invoiced</Text><Text style={styles.metricValue}>{toCurrency(summary.totalInvoiced)}</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>Total Paid</Text><Text style={styles.metricValue}>{toCurrency(summary.totalPaid)}</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>Outstanding</Text><Text style={styles.metricValue}>{toCurrency(summary.outstanding)}</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>Total Expenses</Text><Text style={styles.metricValue}>{toCurrency(summary.totalExpenses)}</Text></View>
            <View style={[styles.metricCard, styles.netCard]}><Text style={styles.metricLabel}>Net (Paid - Expenses)</Text><Text style={styles.metricValue}>{toCurrency(summary.net)}</Text></View>
          </View>

          <View style={styles.monthlyCard}>
            <Text style={styles.sectionTitle}>Last 6 months</Text>
            {monthlySummary.length === 0 ? (
              <Text style={styles.helperText}>No invoice or expense data yet.</Text>
            ) : (
              monthlySummary.map((month) => (
                <View key={month.monthLabel} style={styles.monthRow}>
                  <Text style={styles.monthLabel}>{month.monthLabel}</Text>
                  <View>
                    <Text style={styles.monthValue}>Income: {toCurrency(month.incomeCents)}</Text>
                    <Text style={styles.monthValue}>Expenses: {toCurrency(month.expenseCents)}</Text>
                    <Text style={styles.monthNet}>Net: {toCurrency(month.netCents)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: { borderRadius: 16, padding: 16, backgroundColor: '#120d23', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', gap: 8 },
  heading: { fontSize: 20, fontWeight: '700', color: '#f4f2ff' },
  copy: { color: '#c9c5d8', fontSize: 14, lineHeight: 20 },
  refreshButton: { marginTop: 4, alignSelf: 'flex-start', backgroundColor: '#7c45f3', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  refreshButtonText: { color: '#fff', fontWeight: '700' },
  loadingWrap: { paddingVertical: 24, alignItems: 'center', gap: 8 },
  metricsGrid: { gap: 10 },
  metricCard: { borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2d2250', backgroundColor: '#1a1230' },
  netCard: { borderColor: '#7c45f3' },
  metricLabel: { color: '#c9c5d8', fontSize: 13, marginBottom: 6 },
  metricValue: { color: '#f4f2ff', fontSize: 22, fontWeight: '700' },
  monthlyCard: { borderRadius: 12, borderWidth: 1, borderColor: '#2d2250', backgroundColor: '#1a1230', padding: 14, gap: 10 },
  sectionTitle: { color: '#f4f2ff', fontSize: 17, fontWeight: '700' },
  monthRow: { borderTopWidth: 1, borderTopColor: '#2d2250', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  monthLabel: { color: '#f4f2ff', fontSize: 14, fontWeight: '600' },
  monthValue: { color: '#c9c5d8', fontSize: 13, lineHeight: 18 },
  monthNet: { color: '#e5d9ff', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  helperText: { color: '#a89fc4', fontSize: 14 },
  errorCard: { borderRadius: 12, borderWidth: 1, borderColor: '#6f203e', backgroundColor: '#2a1020', padding: 14, gap: 6 },
  errorTitle: { color: '#ffd8e6', fontWeight: '700' },
  errorText: { color: '#ffd8e6' }
});
