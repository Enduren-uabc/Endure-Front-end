import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Dumbbell, Award, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
import { theme } from '@/theme';
import type { AppTabsParamList } from '@/navigation/types';

type HomeNavigation = BottomTabNavigationProp<AppTabsParamList, 'Home'>;

function CoachStatusBadge() {
  const { data: statusData } = useMyVerificationStatus();
  const navigation = useNavigation<HomeNavigation>();

  if (!statusData || statusData.status === 'none') return null;

  let icon = <Award size={18} color={theme.colors.textSecondary} />;
  let color: string = theme.colors.textSecondary;
  let label = 'Coach';

  if (statusData.status === 'pending') {
    icon = <Clock size={18} color={theme.colors.warning} />;
    color = theme.colors.warning;
    label = 'En revisión';
  } else if (statusData.status === 'approved') {
    icon = <CheckCircle size={18} color={theme.colors.success} />;
    color = theme.colors.success;
    label = 'Coach verificado';
  } else if (statusData.status === 'rejected') {
    icon = <XCircle size={18} color={theme.colors.error} />;
    color = theme.colors.error;
    label = 'Rechazado';
  }

  return (
    <TouchableOpacity
      style={[styles.statusBadge, { borderColor: color }]}
      onPress={() => {
        // Navigate to CoachStack via drawer - use any cast since CoachStack is in drawer, not tabs
        (navigation as any).navigate('CoachStack', { screen: 'CoachHome' });
      }}
    >
      {icon}
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const logoutMutation = useLogout();
  const role = useSessionStore((s) => s.role);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Dumbbell size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Inicio</Text>
          <Text style={styles.subtitle}>
            {role ? `Sesión activa · ${role}` : 'Sesión activa'}
          </Text>
          <CoachStatusBadge />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Empezar entrenamiento"
            onPress={() =>
              navigation.navigate('Workout', { screen: 'WorkoutStart' })
            }
          />
          <PrimaryButton
            label="Ver rutinas"
            onPress={() =>
              navigation.navigate('Routines', { screen: 'RoutinesList' })
            }
          />
          <SecondaryButton
            label={logoutMutation.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
            onPress={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    gap: theme.spacing.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  actions: {
    gap: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceElevated,
  },
  statusBadgeText: {
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
  },
});
