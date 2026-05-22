import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/providers/AuthProvider';

const clientLinks = [
  { label: 'Dashboard', route: 'Client Dashboard' },
  { label: 'Bookings', route: 'Client Bookings' },
  { label: 'Payments', route: 'Client Unpaid Payments' },
  { label: 'Dogs', route: 'Client Dogs' }
];

const adminLinks = [
  { label: 'Overview', route: 'Admin Dashboard' },
  { label: 'Bookings', route: 'Admin Bookings' },
  { label: 'Clients', route: 'Admin Clients' },
  { label: 'Invoices', route: 'Admin Invoices' },
  { label: 'Expenses', route: 'Admin Expenses' },
  { label: 'Receipts', route: 'Admin Receipts' },
  { label: 'Income', route: 'Admin Income Dashboard' }
];

export function ScreenContainer({ title, children }: { title: string; children?: React.ReactNode }): JSX.Element {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { profile } = useAuth();
  const links = profile?.role === 'admin' ? [...adminLinks, ...clientLinks] : clientLinks;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {!!profile && (
          <View style={styles.navWrap}>
            {links.map((link) => {
              const active = route.name === link.route;
              return (
                <Pressable
                  key={link.route}
                  style={[styles.navPill, active && styles.navPillActive]}
                  onPress={() => navigation.navigate(link.route)}
                >
                  <Text style={[styles.navText, active && styles.navTextActive]}>{link.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0c081f' },
  content: { padding: 20, gap: 16 },
  navWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  navPill: {
    borderWidth: 1,
    borderColor: '#7c45f3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1f1535'
  },
  navPillActive: { backgroundColor: '#7c45f3' },
  navText: { color: '#f4f2ff', fontSize: 13, fontWeight: '600' },
  navTextActive: { color: '#ffffff' },
  title: { fontSize: 26, fontWeight: '700', color: '#f4f2ff' },
  body: { gap: 12 }
});
