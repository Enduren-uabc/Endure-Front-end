import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dumbbell, Plus } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import { useRoutines, useStartWorkout } from '@/shared/api/services/trainingService';
import type { RoutineResponseDto } from '@/shared/api/types/training';

export default function RoutinesListScreen() {
  const router = useRouter();
  const { data: routines = [], isLoading, isError, refetch, isRefetching } = useRoutines();
  const startWorkout = useStartWorkout();
  const [startError, setStartError] = React.useState<string | null>(null);

  const handleStartWorkout = (routine: RoutineResponseDto) => {
    setStartError(null);
    startWorkout.mutate(
      { routineId: routine.id },
      {
        onSuccess: (session) => {
          router.push(`/training/workout/${session.id}`);
        },
        onError: (error) => {
          setStartError(error.message);
        },
      },
    );
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
          <Text style={styles.title}>Entrenamiento</Text>
          <Text style={styles.subtitle}>Elige una rutina y empieza una sesión real.</Text>
        </View>

        {isLoading && (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.mutedText}>Cargando rutinas...</Text>
          </View>
        )}

        {isError && (
          <BaseCard>
            <View style={styles.centerBlock}>
              <Text style={styles.errorText}>No pudimos cargar tus rutinas.</Text>
              <PrimaryButton label="Reintentar" onPress={() => refetch()} />
            </View>
          </BaseCard>
        )}

        {!isLoading && !isError && routines.length === 0 && (
          <BaseCard>
            <View style={styles.emptyState}>
              <Dumbbell size={44} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>Aun no tienes rutinas</Text>
              <Text style={styles.emptySubtitle}>
                Crea una rutina con los dias que entrenas para iniciar tu primer workout.
              </Text>
              <PrimaryButton
                label="Crear rutina"
                onPress={() => router.push('/training/routines/create')}
              />
            </View>
          </BaseCard>
        )}

        {!isLoading && !isError && routines.length > 0 && (
          <View style={styles.section}>
            {startError ? <Text style={styles.errorText}>{startError}</Text> : null}
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                isStarting={startWorkout.isPending && startWorkout.variables?.routineId === routine.id}
                isDisabled={startWorkout.isPending}
                onStart={() => handleStartWorkout(routine)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/training/routines/create')}
        activeOpacity={0.85}
      >
        <Plus size={24} color={theme.colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

interface RoutineCardProps {
  routine: RoutineResponseDto;
  isStarting: boolean;
  isDisabled: boolean;
  onStart: () => void;
}

function RoutineCard({ routine, isStarting, isDisabled, onStart }: RoutineCardProps) {
  const exerciseCount = routine.days.reduce((total, day) => total + day.exercises.length, 0);
  const dayCount = routine.days.length;

  return (
    <BaseCard style={styles.routineCard}>
      <View style={styles.routineHeader}>
        <View style={styles.iconBubble}>
          <Dumbbell size={20} color={theme.colors.primary} />
        </View>
        {routine.isActive ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVA</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.routineBody}>
        <Text style={styles.routineName}>{routine.name}</Text>
        <Text style={styles.routineMeta}>
          {dayCount} dias programados · {exerciseCount} ejercicios
        </Text>
      </View>
      <PrimaryButton
        label="Iniciar entrenamiento"
        onPress={onStart}
        loading={isStarting}
        disabled={isDisabled}
      />
    </BaseCard>
  );
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
  centerBlock: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
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
  routineCard: {
    gap: theme.spacing.md,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}1F`,
    alignItems: 'center',
    justifyContent: 'center',
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
  routineBody: {
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
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
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
