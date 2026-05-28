import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dumbbell, Home, UserRound, Users } from 'lucide-react-native';
import HomeTrainingV2Screen from '@/features/home/screens/v2/HomeTrainingV2Screen';
import TrainingStack from '@/navigation/TrainingStack';
import SocialStack from '@/navigation/SocialStack';
import UnifiedProfileScreen from '@/features/profile/screens/UnifiedProfileScreen';
import { theme } from '@/theme';
import type { UserTabsParamList } from '../types/user-navigation.types';

const Tabs = createBottomTabNavigator<UserTabsParamList>();

const TAB_COLORS = {
  active: theme.colors.primary,
  inactive: theme.colors.textMuted,
  barBg: theme.colors.background,
  barBorder: theme.colors.border,
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
        name="Routines"
        component={TrainingStack}
        options={{
          title: 'Rutinas',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={UnifiedProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <UserRound size={size} color={color} />,
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
