import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/providers/AuthProvider';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { ClientDashboardScreen } from '@/screens/client/ClientDashboard';
import { ClientBookingsScreen } from '@/screens/client/ClientBookings';
import { ClientPaymentsScreen } from '@/screens/client/ClientPayments';
import { ClientDogsScreen } from '@/screens/client/ClientDogs';
import { AdminDashboardScreen } from '@/screens/admin/AdminDashboard';
import { AdminBookingsScreen } from '@/screens/admin/AdminBookings';
import { AdminClientsScreen } from '@/screens/admin/AdminClients';
import { AdminInvoicesScreen } from '@/screens/admin/AdminInvoices';
import { AdminExpensesScreen } from '@/screens/admin/AdminExpenses';
import { AdminReceiptsScreen } from '@/screens/admin/AdminReceipts';
import { AdminIncomeScreen } from '@/screens/admin/AdminIncome';
import { AdminRevolutScreen } from '@/screens/admin/AdminRevolut';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator();

function UnsupportedRoleScreen({ role }: { role: string | null | undefined }): JSX.Element {
  return (
    <ScreenContainer title="Account setup needed">
      <Text style={{ color: '#c9c5d8', fontSize: 15, lineHeight: 22 }}>
        This account is signed in, but no mobile screens are configured for role: {role ?? 'none'}.
      </Text>
      <Text style={{ color: '#c9c5d8', fontSize: 15, lineHeight: 22 }}>
        Ask an admin to set your profile role to either "client" or "admin" in the profiles table.
      </Text>
    </ScreenContainer>
  );
}

export function AppNavigator(): JSX.Element {
  const { profile } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!profile && <Stack.Screen name="Welcome" component={WelcomeScreen} />}

        {profile?.role === 'client' && (
          <>
            <Stack.Screen name="Client Dashboard" component={ClientDashboardScreen} />
            <Stack.Screen name="Client Bookings" component={ClientBookingsScreen} />
            <Stack.Screen name="Client Unpaid Payments" component={ClientPaymentsScreen} />
            <Stack.Screen name="Client Dogs" component={ClientDogsScreen} />
          </>
        )}

        {profile?.role === 'admin' && (
          <>
            <Stack.Screen name="Admin Dashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="Admin Bookings" component={AdminBookingsScreen} />
            <Stack.Screen name="Admin Clients" component={AdminClientsScreen} />
            <Stack.Screen name="Admin Invoices" component={AdminInvoicesScreen} />
            <Stack.Screen name="Admin Expenses" component={AdminExpensesScreen} />
            <Stack.Screen name="Admin Receipts" component={AdminReceiptsScreen} />
            <Stack.Screen name="Admin Income Dashboard" component={AdminIncomeScreen} />
            <Stack.Screen name="Admin Revolut" component={AdminRevolutScreen} />
            <Stack.Screen name="Client Dashboard" component={ClientDashboardScreen} />
            <Stack.Screen name="Client Bookings" component={ClientBookingsScreen} />
            <Stack.Screen name="Client Unpaid Payments" component={ClientPaymentsScreen} />
            <Stack.Screen name="Client Dogs" component={ClientDogsScreen} />
          </>
        )}

        {profile && profile.role !== 'client' && profile.role !== 'admin' && (
          <Stack.Screen name="Account Setup" component={() => <UnsupportedRoleScreen role={profile.role} />} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
