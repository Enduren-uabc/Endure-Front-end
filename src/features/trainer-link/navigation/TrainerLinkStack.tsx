import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { theme } from '@/theme';
import SearchTrainerScreen from '../screens/search-trainer';
import TrainerProfileScreen from '../screens/trainer-profile';
import SentLinkRequestsScreen from '../screens/sent-link-requests';
import MyTrainerScreen from '../screens/my-trainer';
import ReceivedLinkRequestsScreen from '../screens/received-link-requests';
import AssignedRoutineScreen from '../screens/assigned-routine';
import type { TrainerLinkStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<TrainerLinkStackParamList>();

export default function TrainerLinkStack() {
  const role = useSessionStore((state) => state.role);

  return (
    <Stack.Navigator
      initialRouteName={role === 'trainer' ? 'ReceivedRequests' : 'MyTrainer'}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontSize: theme.typography.heading3.fontSize,
          fontWeight: theme.typography.heading3.fontWeight,
        },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="SearchTrainer"
        component={SearchTrainerScreen}
        options={{ title: 'Buscar entrenador' }}
      />
      <Stack.Screen
        name="TrainerProfile"
        component={TrainerProfileScreen}
        options={{ title: 'Perfil' }}
      />
      <Stack.Screen
        name="SentRequests"
        component={SentLinkRequestsScreen}
        options={{ title: 'Solicitudes enviadas' }}
      />
      <Stack.Screen
        name="MyTrainer"
        component={MyTrainerScreen}
        options={{ title: 'Mi Entrenador' }}
      />
      <Stack.Screen
        name="AssignedRoutine"
        component={AssignedRoutineScreen}
        options={{ title: 'Rutina asignada' }}
      />
      <Stack.Screen
        name="ReceivedRequests"
        component={ReceivedLinkRequestsScreen}
        options={{ title: 'Solicitudes recibidas' }}
      />
    </Stack.Navigator>
  );
}
