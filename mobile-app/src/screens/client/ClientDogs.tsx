import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';

export function ClientDogsScreen(): JSX.Element {
  return (
    <ScreenContainer title="Client Dogs">
      <Text style={styles.bodyText}>Each client can have multiple dogs. Load from public.dogs filtered by client_id via RLS.</Text>
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({
  bodyText: { color: '#c9c5d8', fontSize: 15, lineHeight: 22 }
});
