import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoutinesListScreen from '@/features/training/screens/routines-list';
import RoutineDetailScreen from '@/features/training/screens/routine-detail';
import CreateRoutineScreen from '@/features/training/screens/create-routine';
import RoutineBuilderScreen from '@/features/training/screens/routine-builder';
import ExerciseCatalogScreen from '@/features/training/screens/exercise-catalog';
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
      <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
      <Stack.Screen name="RoutineBuilder" component={RoutineBuilderScreen} />
      <Stack.Screen name="ExerciseCatalog" component={ExerciseCatalogScreen} />
    </Stack.Navigator>
  );
}
