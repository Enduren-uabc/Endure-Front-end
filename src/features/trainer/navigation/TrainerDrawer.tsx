import React from 'react';
import { StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Dumbbell, Settings, HelpCircle, UsersRound, Inbox } from 'lucide-react-native';
import TrainerTabs from './TrainerTabs';
import TrainerLinkStack from '@/features/trainer-link/navigation/TrainerLinkStack';
import SettingsScreen from '@/features/settings/screens/settings';
import PrivacyScreen from '@/features/privacy/screens/PrivacyScreen';
import HelpScreen from '@/features/help/screens/help';
import { theme } from '@/theme';
import type { TrainerDrawerParamList } from '../types/trainer-navigation.types';

const Drawer = createDrawerNavigator<TrainerDrawerParamList>();

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function TrainerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: '80%',
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerActiveBackgroundColor: 'rgba(59, 130, 246, 0.12)',
        drawerItemStyle: {
          borderRadius: 12,
          paddingHorizontal: 8,
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={TrainerTabs}
        options={{
          title: 'Inicio',
          headerShown: false,
          drawerIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="TrainerLinkStack"
        component={TrainerLinkStack}
        options={{
          title: 'Solicitudes',
          drawerItemStyle: { display: 'none' },
          drawerIcon: ({ color, size }) => <Inbox size={size} color={color} />,
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
        name="PrivacyNotice"
        component={PrivacyScreen}
        options={{
          title: 'Aviso de Privacidad',
          drawerItemStyle: { display: 'none' },
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
  drawerContent: {
    flex: 1,
    paddingTop: 40,
  },
});
