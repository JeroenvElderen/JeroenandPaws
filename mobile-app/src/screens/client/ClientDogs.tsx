import React from 'react';
import { Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';

export function ClientDogsScreen(): JSX.Element {
  return (
    <ScreenContainer title="Client Dogs">
      <Text>Each client can have multiple dogs. Load from public.dogs filtered by client_id via RLS.</Text>
    </ScreenContainer>
  );
}
