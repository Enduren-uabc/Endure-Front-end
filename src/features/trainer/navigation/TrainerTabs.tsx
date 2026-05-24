import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dumbbell, Home, UserRound, UsersRound } from 'lucide-react-native';
import TrainerClientsStack from './TrainerClientsStack';
import TrainerDashboardScreen from '../screens/trainer-dashboard';
import TrainerRoutinesScreen from '../screens/trainer-routines';
import TrainerProfileScreen from '@/features/profile/screens/TrainerProfileScreen';
import { useReceivedLinkRequests } from '@/features/trainer-link/hooks/use-trainer-link';
import { theme } from '@/theme';
import type { TrainerTabsParamList } from '../types/trainer-navigation.types';

const Tabs = createBottomTabNavigator<TrainerTabsParamList>();

const TAB_COLORS = {
  active: theme.colors.primary,
  inactive: theme.colors.textMuted,
  barBg: theme.colors.background,
  barBorder: theme.colors.border,
};

function ClientsTabIcon({ color, size }: { color: string; size: number }) {
  const { data } = useReceivedLinkRequests('pendiente');
  const pendingCount = data?.items?.length ?? 0;

  return (
    <View>
      <UsersRound size={size} color={color} />
      {pendingCount > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>
            {pendingCount > 9 ? '9+' : pendingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TrainerTabs() {
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
        component={TrainerDashboardScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Clients"
        component={TrainerClientsStack}
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => <ClientsTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Routines"
        component={TrainerRoutinesScreen}
        options={{
          title: 'Rutinas',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={TrainerProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <UserRound size={size} color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
