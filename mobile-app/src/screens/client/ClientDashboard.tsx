import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';

export function ClientDashboardScreen(): JSX.Element {
  return <ScreenContainer title="Client Dashboard"><Text style={styles.bodyText}>Data is loaded via Supabase RLS-scoped queries for the signed-in client.</Text></ScreenContainer>;
}


const styles = StyleSheet.create({
  bodyText: { color: '#c9c5d8', fontSize: 15, lineHeight: 22 }
});
