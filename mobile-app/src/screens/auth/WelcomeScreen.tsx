import React, { useState } from 'react';
import { Button, Text, TextInput } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuth } from '@/providers/AuthProvider';

export function WelcomeScreen(): JSX.Element {
  const { activateInviteCode } = useAuth();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  return (
    <ScreenContainer title="Welcome / Enter invite code">
      <Text>Enter the invite code provided by admin to activate your account.</Text>
      <TextInput value={code} onChangeText={setCode} placeholder="Invite code" autoCapitalize="characters" />
      <Button
        title="Activate"
        onPress={async () => {
          const result = await activateInviteCode(code.trim());
          setMessage(result.message);
        }}
      />
      {!!message && <Text>{message}</Text>}
    </ScreenContainer>
  );
}
