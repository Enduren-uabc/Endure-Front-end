import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutStartV2Screen from '@/features/training/screens/v2/WorkoutStartV2Screen';
import WorkoutSessionV2Screen from '@/features/training/screens/v2/WorkoutSessionV2Screen';
import WorkoutFinishSummaryV2Screen from '@/features/training/screens/v2/WorkoutFinishSummaryV2Screen';
import WorkoutHistoryV2Screen from '@/features/training/screens/v2/WorkoutHistoryV2Screen';
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
      <Stack.Screen name="WorkoutStart" component={WorkoutStartV2Screen} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionV2Screen} />
      <Stack.Screen
        name="WorkoutFinishSummary"
        component={WorkoutFinishSummaryV2Screen}
      />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryV2Screen} />
    </Stack.Navigator>
  );
}
