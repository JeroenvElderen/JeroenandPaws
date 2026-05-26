import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuth } from '@/providers/AuthProvider';

export function WelcomeScreen(): React.ReactElement {
  const { activateInviteCode, signIn } = useAuth();
  const [code, setCode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState('');

  return (
    <ScreenContainer title="Welcome / Enter invite code">
      <Text style={styles.bodyText}>Enter the invite code provided by admin to activate your account.</Text>
      <TextInput value={code} onChangeText={setCode} placeholder="Invite code" autoCapitalize="characters" />
      <Button
        title="Activate"
        onPress={async () => {
          const result = await activateInviteCode(code.trim());
          setMessage(result.message);
        }}
      />
      {!!message && <Text style={styles.bodyText}>{message}</Text>}

      <Text style={styles.sectionTitle}>Admin login</Text>
      <Text style={styles.bodyText}>If this is your admin account, sign in directly (no invite code needed).</Text>
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


const styles = StyleSheet.create({
  bodyText: { color: '#c9c5d8', fontSize: 15, lineHeight: 22 },
  sectionTitle: { marginTop: 16, fontWeight: '600', color: '#f4f2ff' }
});
