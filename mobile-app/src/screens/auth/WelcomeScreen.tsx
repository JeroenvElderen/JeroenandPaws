import React, { useState } from 'react';
import { Button, Text, TextInput } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuth } from '@/providers/AuthProvider';

export function WelcomeScreen(): JSX.Element {
  const { activateInviteCode, signIn } = useAuth();
  const [code, setCode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
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

      <Text style={{ marginTop: 16, fontWeight: '600' }}>Admin login</Text>
      <Text>If this is your admin account, sign in directly (no invite code needed).</Text>
      <TextInput
        value={adminEmail}
        onChangeText={setAdminEmail}
        placeholder="Admin email"
        autoCapitalize="none"
      />
      <TextInput
        value={adminPassword}
        onChangeText={setAdminPassword}
        placeholder="Admin password"
        secureTextEntry
        autoCapitalize="none"
      />
      <Button
        title="Sign in as admin"
        onPress={async () => {
          try {
            await signIn(adminEmail.trim(), adminPassword);
            setMessage('Signed in.');
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Sign in failed.';
            setMessage(msg);
          }
        }}
      />
    </ScreenContainer>
  );
}
