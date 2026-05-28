import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Dumbbell, Settings, HelpCircle, Inbox, LogOut } from 'lucide-react-native';
import TrainerTabs from './TrainerTabs';
import TrainingStack from '@/navigation/TrainingStack';
import WorkoutStack from '@/navigation/WorkoutStack';
import TrainerLinkStack from '@/features/trainer-link/navigation/TrainerLinkStack';
import SettingsStack from '@/features/settings/navigation/SettingsStack';
import PrivacyScreen from '@/features/privacy/screens/PrivacyScreen';
import HelpScreen from '@/features/help/screens/help';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { theme } from '@/theme';
import type { TrainerDrawerParamList } from '../types/trainer-navigation.types';

const Drawer = createDrawerNavigator<TrainerDrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => logoutMutation.mutate(),
        },
      ],
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <DrawerItemList {...props} />
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={[styles.logoutButton, logoutMutation.isPending && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
          activeOpacity={0.7}
        >
          {logoutMutation.isPending ? (
            <ActivityIndicator color={theme.colors.error} />
          ) : (
            <>
              <LogOut size={18} color={theme.colors.error} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </>
          )}
        </TouchableOpacity>
        {logoutMutation.isError && (
          <Text style={styles.errorText}>
            {logoutMutation.error?.message ?? 'Error al cerrar sesión'}
          </Text>
        )}
      </View>
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
          drawerIcon: ({ color, size }) => <Inbox size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="WorkoutStack"
        component={WorkoutStack}
        options={{
          title: 'Entrenamiento',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="TrainingStack"
        component={TrainingStack}
        options={{
          title: 'Rutinas',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsStack}
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
  logoutSection: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
  },
  logoutButtonDisabled: {
    borderColor: theme.colors.borderSoft,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
