import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { assertEnv } from '@/lib/env';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';

function Root(): JSX.Element {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App(): JSX.Element {
  assertEnv();
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
