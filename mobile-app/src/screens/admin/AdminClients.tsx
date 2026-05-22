import React from 'react';
import { Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';

export function AdminClientsScreen(): JSX.Element {
  return <ScreenContainer title="Admin Clients"><Text>Admin-only business view. Connect to secure backend APIs hosted on Vercel.</Text></ScreenContainer>;
}
