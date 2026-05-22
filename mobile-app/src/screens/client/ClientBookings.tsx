import React from 'react';
import { Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';

export function ClientBookingsScreen(): JSX.Element {
  return <ScreenContainer title="Client Bookings"><Text>Data is loaded via Supabase RLS-scoped queries for the signed-in client.</Text></ScreenContainer>;
}
