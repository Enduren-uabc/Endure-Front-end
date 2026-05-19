import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Dumbbell, Settings, HelpCircle, Award, ChevronRight, Shield } from 'lucide-react-native';
import AppTabs from './AppTabs';
import CoachStack from './CoachStack';
import AdminStack from './AdminStack';
import SettingsScreen from '@/features/settings/screens/settings';
import HelpScreen from '@/features/help/screens/help';
import { theme } from '@/theme';
import type { AppDrawerParamList } from './types';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
import { useSessionStore } from '@/features/auth/stores/session-store';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

function CustomDrawerContent(props: any) {
  const { data: statusData } = useMyVerificationStatus();
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
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  const role = useSessionStore((s) => s.role);
  const isAdmin = role === 'admin';

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
        component={AppTabs}
        options={{
          title: 'Inicio',
          headerShown: false,
          drawerIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      {isAdmin ? (
        <Drawer.Screen
          name="AdminStack"
          component={AdminStack}
          options={{
            title: 'Administración',
            drawerIcon: ({ color, size }) => <Shield size={size} color={color} />,
          }}
        />
      ) : (
        <Drawer.Screen
          name="CoachStack"
          component={CoachStack}
          options={{
            title: 'Verificación de Entrenador',
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => <Award size={size} color={color} />,
          }}
        />
      )}
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
});
