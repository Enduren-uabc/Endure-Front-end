import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutStartV2Screen from '@/features/training/screens/v2/WorkoutStartV2Screen';
import WorkoutSessionV2Screen from '@/features/training/screens/v2/WorkoutSessionV2Screen';
import WorkoutFinishSummaryV2Screen from '@/features/training/screens/v2/WorkoutFinishSummaryV2Screen';
import WorkoutHistoryV2Screen from '@/features/training/screens/v2/WorkoutHistoryV2Screen';
import WorkoutSessionDetailV2Screen from '@/features/training/screens/v2/WorkoutSessionDetailV2Screen';
import ExerciseProgressV2Screen from '@/features/training/screens/v2/ExerciseProgressV2Screen';
import AchievementsV2Screen from '@/features/training/screens/v2/AchievementsV2Screen';
import MeasurementsV2Screen from '@/features/training/screens/v2/MeasurementsV2Screen';
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
      <Stack.Screen name="WorkoutSessionDetail" component={WorkoutSessionDetailV2Screen} />
      <Stack.Screen name="ExerciseProgress" component={ExerciseProgressV2Screen} />
      <Stack.Screen name="Achievements" component={AchievementsV2Screen} />
      <Stack.Screen name="Measurements" component={MeasurementsV2Screen} />
    </Stack.Navigator>
  );
}
