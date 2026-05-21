import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShieldCheck, ClipboardList } from 'lucide-react-native';
import AdminStack from './AdminStack';
import type { AdminTabsParamList } from '../types/admin-navigation.types';

const Tabs = createBottomTabNavigator<AdminTabsParamList>();

export default function AdminTabs() {
  return (
    <Tabs.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0E0E10',
          borderTopColor: '#3F3F46',
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FACC15',
        tabBarInactiveTintColor: '#71717A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        component={AdminStack}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <ShieldCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Verifications"
        component={AdminStack}
        options={{
          title: 'Verificaciones',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}
