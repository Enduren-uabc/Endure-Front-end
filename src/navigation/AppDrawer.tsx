import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { User, Settings, HelpCircle } from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';
import AppTabs from './AppTabs';
import { theme } from '@/theme';

const Drawer = createDrawerNavigator();

function DrawerPlaceholder({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

function SettingsScreen() {
  return <DrawerPlaceholder title="Configuración" />;
}

function HelpScreen() {
  return <DrawerPlaceholder title="Ayuda" />;
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Main"
        component={AppTabs}
        options={{
          title: 'Inicio',
          drawerIcon: ({ color, size }) => <User size={size} color={color} />,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
  },
});
