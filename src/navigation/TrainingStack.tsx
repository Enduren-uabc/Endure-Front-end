import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoutinesListScreen from '@/features/training/screens/routines-list';
import RoutineDetailScreen from '@/features/training/screens/routine-detail';
import RoutineBuilderScreen from '@/features/training/screens/routine-builder';
import ExerciseDetailScreen from '@/features/training/screens/exercise-detail';
import { TrainingStackParamList } from './types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<TrainingStackParamList>();

export default function TrainingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="RoutinesList" component={RoutinesListScreen} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
      <Stack.Screen name="RoutineBuilder" component={RoutineBuilderScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
    </Stack.Navigator>
  );
}
