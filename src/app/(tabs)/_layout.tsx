import React from 'react';
import { Tabs } from 'expo-router';
import { theme } from '@/theme';
import { TabBarIcon, tabBarColors } from '@/shared/components/TabBarIcon';

export default function AppTabsLayout() {
  return (
    <Tabs
      initialRouteName="training"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBarColors.active,
        tabBarInactiveTintColor: tabBarColors.inactive,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          minHeight: 64,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.caption.fontSize,
          lineHeight: theme.typography.caption.lineHeight,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="social"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="feed" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: 'Entrenar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="training" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profiles/me"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
