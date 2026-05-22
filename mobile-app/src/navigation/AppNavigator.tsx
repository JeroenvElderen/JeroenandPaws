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

const Stack = createNativeStackNavigator();

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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
