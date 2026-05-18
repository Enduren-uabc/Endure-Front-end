import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import type { OnboardingStackParamList } from './types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración inicial</Text>
    </View>
  );
}

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Goal" component={OnboardingPlaceholder} />
      <Stack.Screen name="BasicData" component={OnboardingPlaceholder} />
      <Stack.Screen name="Level" component={OnboardingPlaceholder} />
      <Stack.Screen name="Summary" component={OnboardingPlaceholder} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
});
