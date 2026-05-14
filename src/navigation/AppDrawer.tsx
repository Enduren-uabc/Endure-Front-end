import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Dumbbell, Settings, HelpCircle } from 'lucide-react-native';
import AppTabs from './AppTabs';
import SettingsScreen from '@/features/settings/screens/settings';
import HelpScreen from '@/features/help/screens/help';
import { theme } from '@/theme';
import type { AppDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontSize: theme.typography.heading3.fontSize,
          fontWeight: theme.typography.heading3.fontWeight,
        },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={AppTabs}
        options={{
          title: 'Inicio',
          drawerIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
          drawerIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: 'Ayuda',
          drawerIcon: ({ color, size }) => <HelpCircle size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}
