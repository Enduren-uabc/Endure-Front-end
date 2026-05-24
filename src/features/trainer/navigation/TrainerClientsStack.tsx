import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrainerClientsScreen from '@/features/trainer/screens/trainer-clients';
import ClientProgressScreen from '@/features/trainer/screens/client-progress';
import { theme } from '@/theme';
import type { TrainerClientsStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<TrainerClientsStackParamList>();

export default function TrainerClientsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        headerTitleStyle: {
          color: theme.colors.textPrimary,
          fontSize: theme.typography.heading3.fontSize,
          fontWeight: theme.typography.heading3.fontWeight,
        },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="ClientsList"
        component={TrainerClientsScreen}
        options={{ title: 'Clientes', headerShown: false }}
      />
      <Stack.Screen
        name="ClientProgress"
        component={ClientProgressScreen}
        options={({ route }) => ({ title: route.params.clientName })}
      />
    </Stack.Navigator>
  );
}
