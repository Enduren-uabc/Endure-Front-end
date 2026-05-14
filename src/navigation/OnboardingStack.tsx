import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GoalScreen from '@/features/onboarding/screens/goal';
import BasicDataScreen from '@/features/onboarding/screens/basic-data';
import LevelScreen from '@/features/onboarding/screens/level';
import SummaryScreen from '@/features/onboarding/screens/summary';
import type { OnboardingStackParamList } from './types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="Goal"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="BasicData" component={BasicDataScreen} />
      <Stack.Screen name="Level" component={LevelScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
    </Stack.Navigator>
  );
}
