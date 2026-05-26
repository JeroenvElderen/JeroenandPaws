import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';

export function AdminExpensesScreen(): React.ReactElement {
  return <ScreenContainer title="Admin Expenses"><Text style={styles.bodyText}>Admin-only business view. Connect to secure backend APIs hosted on Vercel.</Text></ScreenContainer>;
}


const styles = StyleSheet.create({
  bodyText: { color: '#c9c5d8', fontSize: 15, lineHeight: 22 }
});
