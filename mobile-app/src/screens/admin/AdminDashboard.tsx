import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '@/components/ScreenContainer';

const quickLinks = [
  { label: 'Bookings', route: 'Admin Bookings' },
  { label: 'Clients', route: 'Admin Clients' },
  { label: 'Invoices', route: 'Admin Invoices' },
  { label: 'Expenses', route: 'Admin Expenses' },
  { label: 'Receipts', route: 'Admin Receipts' },
  { label: 'Income Dashboard', route: 'Admin Income Dashboard' },
  { label: 'Revolut Hub', route: 'Admin Revolut' }
];

export function AdminDashboardScreen(): JSX.Element {
  const navigation = useNavigation<any>();

  return (
    <ScreenContainer title="Admin Dashboard">
      <View style={styles.card}>
        <Text style={styles.heading}>Business overview</Text>
        <Text style={styles.copy}>
          Use the links below to manage bookings, clients, invoices, and reports.
        </Text>
      </View>

      <View style={styles.grid}>
        {quickLinks.map((link) => (
          <Pressable key={link.route} onPress={() => navigation.navigate(link.route)} style={styles.linkCard}>
            <Text style={styles.linkLabel}>{link.label}</Text>
          </Pressable>
        ))}
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
  linkLabel: { color: '#f4f2ff', fontSize: 16, fontWeight: '600' }
});
