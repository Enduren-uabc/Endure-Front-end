import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dumbbell, Home, Play, Users } from 'lucide-react-native';
import HomeTrainingV2Screen from '@/features/home/screens/v2/HomeTrainingV2Screen';
import TrainingStack from '@/navigation/TrainingStack';
import WorkoutStack from '@/navigation/WorkoutStack';
import SocialStack from '@/navigation/SocialStack';
import { theme } from '@/theme';
import type { UserTabsParamList } from '../types/user-navigation.types';

const Tabs = createBottomTabNavigator<UserTabsParamList>();

const TAB_COLORS = {
  active: theme.colors.primary,
  inactive: theme.colors.textMuted,
  barBg: theme.colors.background,
  barBorder: theme.colors.border,
  workoutBtnBg: theme.colors.surfaceElevated,
  workoutBtnBgActive: theme.colors.primaryMuted,
  workoutBtnBorder: theme.colors.border,
  workoutBtnBorderActive: theme.colors.primary,
};

export default function UserTabs() {
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_COLORS.barBg,
          borderTopColor: TAB_COLORS.barBorder,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: TAB_COLORS.active,
        tabBarInactiveTintColor: TAB_COLORS.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeTrainingV2Screen}
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
                  accessibilityState?.selected
                    ? styles.workoutTabButtonActive
                    : styles.workoutTabButtonInactive,
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
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Social"
        component={SocialStack}
        options={{
          title: 'Comunidad',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
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
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  workoutTabButtonActive: {
    backgroundColor: TAB_COLORS.workoutBtnBgActive,
    borderColor: TAB_COLORS.workoutBtnBorderActive,
  },
  workoutTabButtonInactive: {
    backgroundColor: TAB_COLORS.workoutBtnBg,
    borderColor: TAB_COLORS.workoutBtnBorder,
  },
});
