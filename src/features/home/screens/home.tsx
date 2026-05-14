import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Dumbbell } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { theme } from '@/theme';
import type { AppTabsParamList } from '@/navigation/types';

type HomeNavigation = BottomTabNavigationProp<AppTabsParamList, 'Home'>;

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
        </View>

        <View style={styles.actions}>
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
});
