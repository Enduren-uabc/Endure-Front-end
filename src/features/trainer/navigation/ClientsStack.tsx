import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrainerClientsScreen from '../screens/trainer-clients';
import TrainerClientDetailScreen from '../screens/trainer-client-detail';
import type { ClientsStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export default function ClientsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="ClientList" component={TrainerClientsScreen} />
      <Stack.Screen name="ClientDetail" component={TrainerClientDetailScreen} />
    </Stack.Navigator>
  );
}
