import React from 'react';
import { ActivityIndicator, Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Dumbbell, Settings, Award, ChevronRight, Link2, LogOut } from 'lucide-react-native';
import UserTabs from './UserTabs';
import CoachStack from '@/navigation/CoachStack';
import WorkoutStack from '@/navigation/WorkoutStack';
import TrainerLinkStack from '@/features/trainer-link/navigation/TrainerLinkStack';
import SettingsStack from '@/features/settings/navigation/SettingsStack';
import PrivacyScreen from '@/features/privacy/screens/PrivacyScreen';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { theme } from '@/theme';
import type { UserDrawerParamList } from '../types/user-navigation.types';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';

const Drawer = createDrawerNavigator<UserDrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { data: statusData } = useMyVerificationStatus();
  const logoutMutation = useLogout();
  const navigation = props.navigation;

  let ctaTitle = 'Hazte coach';
  let ctaSubtitle = 'Verifica tu perfil como entrenador';
  let ctaColor: string = theme.colors.primary;
  let ctaBg = 'rgba(59, 130, 246, 0.08)';

  if (statusData?.status === 'approved') {
    ctaTitle = 'Panel de coach';
    ctaSubtitle = 'Gestiona tus clientes y rutinas';
    ctaColor = theme.colors.success;
    ctaBg = 'rgba(47, 224, 113, 0.08)';
  } else if (statusData?.status === 'pending') {
    ctaTitle = 'Verificacion en curso';
    ctaSubtitle = 'Tu solicitud esta en revision';
    ctaColor = theme.colors.warning;
    ctaBg = 'rgba(255, 138, 0, 0.08)';
  } else if (statusData?.status === 'rejected') {
    ctaTitle = 'Reenviar solicitud';
    ctaSubtitle = 'Tu solicitud fue rechazada';
    ctaColor = theme.colors.error;
    ctaBg = 'rgba(255, 77, 79, 0.08)';
  }

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
      <TouchableOpacity
        style={[styles.ctaCard, { borderColor: ctaColor, backgroundColor: ctaBg }]}
        onPress={() => navigation.navigate('CoachStack', { screen: 'CoachHome' })}
        activeOpacity={0.8}
      >
        <Award size={28} color={ctaColor} />
        <View style={styles.ctaTextContainer}>
          <Text style={[styles.ctaTitle, { color: ctaColor }]}>{ctaTitle}</Text>
          <Text style={styles.ctaSubtitle}>{ctaSubtitle}</Text>
        </View>
        <ChevronRight size={20} color={ctaColor} />
      </TouchableOpacity>
      <View style={styles.menuContainer}>
        <DrawerItemList {...props} />
      </View>
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

export default function UserDrawer() {
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
        component={UserTabs}
        options={{
          title: 'Inicio',
          headerShown: false,
          drawerIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="CoachStack"
        component={CoachStack}
        options={{
          title: 'Verificación de Entrenador',
          drawerItemStyle: { display: 'none' },
          drawerIcon: ({ color, size }) => <Award size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="TrainerLinkStack"
        component={TrainerLinkStack}
        options={{
          title: 'Mi entrenador',
          drawerIcon: ({ color, size }) => <Link2 size={size} color={color} />,
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
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 40,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  ctaTextContainer: {
    flex: 1,
    gap: 4,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  ctaSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  menuContainer: {
    paddingHorizontal: 8,
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
