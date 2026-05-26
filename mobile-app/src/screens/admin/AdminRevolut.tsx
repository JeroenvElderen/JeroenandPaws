import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { env } from '@/lib/env';

type RevolutEndpoint = {
  label: string;
  path: string;
  description: string;
};

const endpoints: RevolutEndpoint[] = [
  { label: 'Business Accounts', path: '/api/revolut/accounts', description: 'Balances and account metadata.' },
  { label: 'Business Transactions', path: '/api/revolut/business/transactions?count=20', description: 'Latest business ledger movements.' },
  { label: 'Counterparties', path: '/api/revolut/business/counterparties', description: 'Saved payees and business beneficiaries.' },
  { label: 'Merchant Accounts', path: '/api/revolut/merchant/accounts', description: 'Merchant settlement accounts.' },
  { label: 'Merchant Transactions', path: '/api/revolut/merchant/transactions?count=20', description: 'Recent card/merchant payment activity.' }
];

export function AdminRevolutScreen(): JSX.Element {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [result, setResult] = useState<string>('Tap an endpoint to fetch live Revolut data.');

  const fetchEndpoint = async (endpoint: RevolutEndpoint) => {
    setLoadingKey(endpoint.path);
    try {
      const url = `${env.vercelBackendUrl}${endpoint.path}`;
      const response = await fetch(url);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(error?.message ?? 'Failed to load Revolut data');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <ScreenContainer title="Admin Revolut (Business + Merchant)">
      <View style={styles.card}>
        <Text style={styles.heading}>Revolut controls</Text>
        <Text style={styles.copy}>
          This hub gives you one-tap access to both Revolut Business and Revolut Merchant endpoints.
        </Text>
      </View>

      <View style={styles.grid}>
        {endpoints.map((endpoint) => (
          <Pressable key={endpoint.path} onPress={() => fetchEndpoint(endpoint)} style={styles.linkCard}>
            <Text style={styles.linkLabel}>{endpoint.label}</Text>
            <Text style={styles.linkDescription}>{endpoint.description}</Text>
            {loadingKey === endpoint.path && <ActivityIndicator color="#c9c5d8" style={styles.loader} />}
          </Pressable>
        ))}
      </View>

      <View style={styles.outputCard}>
        <Text style={styles.outputTitle}>Last response</Text>
        <Text style={styles.outputText}>{result}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#120d23',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  heading: { fontSize: 18, fontWeight: '700', color: '#f4f2ff', marginBottom: 8 },
  copy: { fontSize: 15, lineHeight: 22, color: '#c9c5d8' },
  grid: { gap: 10 },
  linkCard: {
    backgroundColor: '#1f1535',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7c45f3'
  },
  linkLabel: { color: '#f4f2ff', fontSize: 16, fontWeight: '600' },
  linkDescription: { color: '#c9c5d8', fontSize: 13, marginTop: 6 },
  loader: { marginTop: 10 },
  outputCard: { backgroundColor: '#120d23', borderRadius: 12, borderWidth: 1, borderColor: '#302451', padding: 12 },
  outputTitle: { color: '#f4f2ff', fontWeight: '700', marginBottom: 6 },
  outputText: { color: '#c9c5d8', fontSize: 12, lineHeight: 18 }
});
