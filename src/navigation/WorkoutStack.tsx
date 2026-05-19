import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutStartScreen from '@/features/training/screens/workout-start';
import WorkoutSessionScreen from '@/features/training/screens/workout-session';
import WorkoutFinishSummaryScreen from '@/features/training/screens/workout-finish-summary';
import WorkoutHistoryScreen from '@/features/training/screens/workout-history';
import type { WorkoutStackParamList } from './types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

export default function WorkoutStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="WorkoutStart" component={WorkoutStartScreen} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
      <Stack.Screen
        name="WorkoutFinishSummary"
        component={WorkoutFinishSummaryScreen}
      />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
    </Stack.Navigator>
  );
}
