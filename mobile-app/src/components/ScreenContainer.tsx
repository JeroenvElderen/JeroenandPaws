import React, { useState } from 'react';
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

export function ScreenContainer({ title, children }: { title: string; children?: React.ReactNode }): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const links = profile?.role === 'admin' ? [...adminLinks, ...clientLinks] : clientLinks;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {!!profile && (
          <View style={styles.navContainer}>
            <Pressable style={styles.burgerButton} onPress={() => setOpen((value) => !value)}>
              <Text style={styles.burgerText}>☰ Menu</Text>
            </Pressable>
            {open ? (
              <View style={styles.dropdown}>
                {links.map((link) => {
                  const active = route.name === link.route;
                  return (
                    <Pressable
                      key={link.route}
                      style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                      onPress={() => { navigation.navigate(link.route); setOpen(false); }}
                    >
                      <Text style={[styles.dropdownText, active && styles.dropdownTextActive]}>{link.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
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
  navContainer: { position: 'relative', zIndex: 10 },
  burgerButton: { borderWidth: 1, borderColor: '#7c45f3', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#1f1535', alignSelf: 'flex-start' },
  burgerText: { color: '#f4f2ff', fontSize: 14, fontWeight: '700' },
  dropdown: { marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: '#3f2c67', backgroundColor: '#17112b', overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#2a2044' },
  dropdownItemActive: { backgroundColor: '#7c45f3' },
  dropdownText: { color: '#f4f2ff', fontWeight: '600' },
  dropdownTextActive: { color: '#fff' },
  title: { fontSize: 26, fontWeight: '700', color: '#f4f2ff' },
  body: { gap: 12 }
});
