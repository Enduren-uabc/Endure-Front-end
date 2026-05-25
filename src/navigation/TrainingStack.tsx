import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoutinesListV2Screen from '@/features/training/screens/v2/RoutinesListV2Screen';
import RoutineDetailV2Screen from '@/features/training/screens/v2/RoutineDetailV2Screen';
import RoutineEditV2Screen from '@/features/training/screens/v2/RoutineEditV2Screen';
import RoutineBuilderV2Screen from '@/features/training/screens/v2/RoutineBuilderV2Screen';
import ExerciseCatalogV2Screen from '@/features/training/screens/v2/ExerciseCatalogV2Screen';
import ExerciseDetailV2Screen from '@/features/training/screens/v2/ExerciseDetailV2Screen';
import ManualExerciseV2Screen from '@/features/training/screens/v2/ManualExerciseV2Screen';
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
      <Stack.Screen name="RoutinesList" component={RoutinesListV2Screen} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailV2Screen} />
      <Stack.Screen name="RoutineEdit" component={RoutineEditV2Screen} />
      <Stack.Screen name="RoutineBuilder" component={RoutineBuilderV2Screen} />
      <Stack.Screen name="ExerciseCatalog" component={ExerciseCatalogV2Screen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailV2Screen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ManualExercise" component={ManualExerciseV2Screen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
