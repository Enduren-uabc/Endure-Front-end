import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Dumbbell, Plus, ChevronRight } from 'lucide-react-native';
import { useRoutines } from '@/features/training/hooks/use-routines';
import type { TrainingStackParamList } from '@/navigation/types';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import type { Routine } from '@/features/training/types/routine';

export default function RoutinesListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TrainingStackParamList>>();
  const { data: routines = [], isLoading, isError, refetch, isRefetching } = useRoutines();

  const activeRoutine = routines.find((r) => r.isActive);
  const inactiveRoutines = routines.filter((r) => !r.isActive);

  const handleRoutinePress = (routine: Routine) => {
    navigation.navigate('RoutineDetail', { id: routine.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Tus Rutinas</Text>
          <Text style={styles.subtitle}>Gestiona tus entrenamientos</Text>
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {isError && (
          <BaseCard>
            <View style={styles.center}>
              <Text style={styles.errorText}>Error al cargar rutinas</Text>
              <PrimaryButton label="Reintentar" onPress={() => refetch()} />
            </View>
          </BaseCard>
        )}

        {!isLoading && !isError && routines.length === 0 && (
          <BaseCard>
            <View style={styles.emptyState}>
              <Dumbbell size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>Aún no tienes rutinas</Text>
              <Text style={styles.emptySubtitle}>
                Crea tu primera rutina para empezar a entrenar de forma estructurada.
              </Text>
              <PrimaryButton
                label="Crear rutina"
                onPress={() => navigation.navigate('CreateRoutine')}
              />
            </View>
          </BaseCard>
        )}

        {activeRoutine && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rutina Activa</Text>
            <TouchableOpacity onPress={() => handleRoutinePress(activeRoutine)}>
              <BaseCard style={styles.activeCard}>
                <View style={styles.activeHeader}>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVA</Text>
                  </View>
                </View>
                <Text style={styles.routineName}>{activeRoutine.name}</Text>
                <Text style={styles.routineMeta}>
                  {(activeRoutine.dayOfWeeks ?? []).length} días · {countExercises(activeRoutine)} ejercicios
                </Text>
              </BaseCard>
            </TouchableOpacity>
          </View>
        )}

        {inactiveRoutines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {activeRoutine ? 'Otras rutinas' : 'Tus rutinas'}
            </Text>
            {inactiveRoutines.map((routine) => (
              <TouchableOpacity
                key={routine.id}
                onPress={() => handleRoutinePress(routine)}
                style={styles.routineItem}
              >
                <BaseCard style={styles.routineCard}>
                  <View style={styles.routineRow}>
                    <View style={styles.routineInfo}>
                      <Text style={styles.routineName}>{routine.name}</Text>
                      <Text style={styles.routineMeta}>
                        {(routine.dayOfWeeks ?? []).length} días · {countExercises(routine)} ejercicios
                      </Text>
                    </View>
                    <ChevronRight size={20} color={theme.colors.textMuted} />
                  </View>
                </BaseCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateRoutine')}
        >
          <Plus size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function countExercises(routine: Routine): number {
  return (routine.days ?? []).reduce((sum, day) => sum + (day.exercises ?? []).length, 0);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl * 2,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  greeting: {
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
  center: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeCard: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    gap: theme.spacing.sm,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  activeBadge: {
    backgroundColor: `${theme.colors.primary}33`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  activeBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  routineItem: {
    marginBottom: theme.spacing.md,
  },
  routineCard: {
    padding: theme.spacing.md,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routineInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  routineName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  routineMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
