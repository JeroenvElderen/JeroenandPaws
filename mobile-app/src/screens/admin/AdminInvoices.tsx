import React from 'react';
import { Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';

export function AdminInvoicesScreen(): JSX.Element {
  return <ScreenContainer title="Admin Invoices"><Text>Admin-only business view. Connect to secure backend APIs hosted on Vercel.</Text></ScreenContainer>;
}
