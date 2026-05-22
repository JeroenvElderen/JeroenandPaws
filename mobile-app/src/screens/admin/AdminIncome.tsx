import React from 'react';
import { Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';

export function AdminIncomeScreen(): JSX.Element {
  return <ScreenContainer title="Admin Income"><Text>Admin-only business view. Connect to secure backend APIs hosted on Vercel.</Text></ScreenContainer>;
}
