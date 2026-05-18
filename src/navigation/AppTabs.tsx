import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dumbbell, Home, Play } from 'lucide-react-native';
import HomeScreen from '@/features/home/screens/home';
import TrainingStack from './TrainingStack';
import WorkoutStack from './WorkoutStack';
import { theme } from '@/theme';
import type { AppTabsParamList } from './types';

const Tabs = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: theme.typography.caption.fontSize,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Workout"
        component={WorkoutStack}
        options={{
          title: 'Entrenar',
          tabBarIcon: ({ color, size }) => <Play size={size} color={color} />,
          tabBarButton: ({ children, onPress, accessibilityState }) => (
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.86}
              style={styles.workoutTabOuter}
            >
              <View
                style={[
                  styles.workoutTabButton,
                  accessibilityState?.selected && styles.workoutTabButtonActive,
                ]}
              >
                {children}
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="Routines"
        component={TrainingStack}
        options={{
          title: 'Rutinas',
          tabBarIcon: ({ color, size }) => (
            <Dumbbell size={size} color={color} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  workoutTabOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  workoutTabButton: {
    width: 76,
    minHeight: 60,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  workoutTabButtonActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
});
