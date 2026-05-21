import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '@/theme';
import PendingVerificationsScreen from '@/features/admin/screens/PendingVerificationsScreen';
import VerificationDetailScreen from '@/features/admin/screens/VerificationDetailScreen';
import type { AdminStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="PendingVerifications"
        component={PendingVerificationsScreen}
        options={{ title: 'Administración' }}
      />
      <Stack.Screen
        name="VerificationDetail"
        component={VerificationDetailScreen}
        options={{ title: 'Detalle de solicitud' }}
      />
    </Stack.Navigator>
  );
}
