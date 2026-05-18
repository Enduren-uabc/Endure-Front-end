import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '@/theme';
import CoachHome from '@/features/trainer-verification/screens/coach-home';
import CoachForm from '@/features/trainer-verification/screens/coach-form';
import CoachStatus from '@/features/trainer-verification/screens/coach-status';
import CoachRejected from '@/features/trainer-verification/screens/coach-rejected';
import type { CoachStackParamList } from './types';

const Stack = createNativeStackNavigator<CoachStackParamList>();

export default function CoachStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontSize: theme.typography.heading3.fontSize,
          fontWeight: theme.typography.heading3.fontWeight,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="CoachHome"
        component={CoachHome}
        options={{ title: 'Verificación de Entrenador' }}
      />
      <Stack.Screen
        name="CoachForm"
        component={CoachForm}
        options={{ title: 'Solicitud de Entrenador' }}
      />
      <Stack.Screen
        name="CoachStatus"
        component={CoachStatus}
        options={{ title: 'Estado de Solicitud' }}
      />
      <Stack.Screen
        name="CoachRejected"
        component={CoachRejected}
        options={{ title: 'Solicitud Rechazada' }}
      />
    </Stack.Navigator>
  );
}
