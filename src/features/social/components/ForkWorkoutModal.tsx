import React from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X, GitFork, CheckCircle2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { DragIndicator } from '@/components/ui/DragIndicator';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { useRoutines } from '@/features/training/hooks/use-routines';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { Publication } from '../types/social.types';
import { useForkWorkout } from '../hooks/use-fork-workout';

interface ForkWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  publication: Publication | null;
  currentUserId: string;
}

export default function ForkWorkoutModal({
  visible,
  onClose,
  publication,
  currentUserId,
}: ForkWorkoutModalProps) {
  const { data: routines, isLoading: routinesLoading } = useRoutines();
  const forkMutation = useForkWorkout();
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const [successDay, setSuccessDay] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setSelectedDay(null);
      setSuccessDay(null);
    }
  }, [visible]);

  const activeRoutine = routines?.find((r) => r.isActive);
  const days = activeRoutine?.days ?? [];
  const summary = publication?.exerciseSummary;

  const handleFork = () => {
    if (!selectedDay || !publication?.workoutSessionId) return;

    forkMutation.mutate(
      {
        routineId: activeRoutine!.id,
        dayOfWeek: selectedDay,
        sourceWorkoutSessionId: publication.workoutSessionId,
      },
      {
        onSuccess: () => {
          setSuccessDay(selectedDay);
        },
        onError: () => {
          Alert.alert('Error', 'No se pudo importar el entrenamiento. Intenta de nuevo.');
        },
      },
    );
  };

  if (!publication || publication.authorUserId === currentUserId) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <DragIndicator position="inside" />
          <View style={styles.sheetHeader}>
            <GitFork size={20} color={theme.colors.primary} />
            <Text style={styles.sheetTitle}>Importar entrenamiento</Text>
            <Pressable onPress={onClose} accessibilityLabel="Cerrar">
              <X size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {!activeRoutine ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tienes una rutina activa</Text>
              <Text style={styles.emptyText}>
                Crea una rutina primero para poder importar ejercicios.
              </Text>
            </View>
          ) : routinesLoading ? (
            <Text style={styles.loadingText}>Cargando rutinas...</Text>
          ) : successDay ? (
            <View style={styles.successState}>
              <CheckCircle2 size={44} color={theme.colors.success} />
              <Text style={styles.successTitle}>Entrenamiento agregado</Text>
              <Text style={styles.successText}>
                Los ejercicios se agregaron a {DAY_OF_WEEK_LABELS[successDay as keyof typeof DAY_OF_WEEK_LABELS] ?? successDay} en "{activeRoutine.name}".
              </Text>
              <PrimaryButton
                label="Listo"
                onPress={onClose}
              />
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.routineName}>
                Rutina: {activeRoutine.name}
              </Text>

              {summary ? (
                <BaseCard style={styles.exercisesCard}>
                  <Text style={styles.exercisesTitle}>Ejercicios a importar</Text>
                  {summary.exercises.map((ex, i) => (
                    <View key={ex.exerciseId} style={styles.exerciseRow}>
                      <Text style={styles.exerciseIndex}>{i + 1}.</Text>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                        <Text style={styles.exerciseSets}>
                          {ex.totalSets} sets · {ex.completedSets}/{ex.totalSets} completados
                        </Text>
                      </View>
                    </View>
                  ))}
                </BaseCard>
              ) : null}

              <Text style={styles.daySelectorLabel}>¿A qué día agregarlos?</Text>
              <View style={styles.dayChips}>
                {days.length === 0 ? (
                  <Text style={styles.noDaysText}>
                    Tu rutina no tiene días. Crea un día primero.
                  </Text>
                ) : (
                  days.map((day) => {
                    const label = DAY_OF_WEEK_LABELS[day.dayOfWeek as keyof typeof DAY_OF_WEEK_LABELS] ?? day.dayOfWeek;
                    return (
                      <Pressable
                        key={day.dayOfWeek}
                        style={[
                          styles.dayChip,
                          selectedDay === day.dayOfWeek && styles.dayChipActive,
                        ]}
                        onPress={() => setSelectedDay(day.dayOfWeek)}
                      >
                        <Text
                          style={[
                            styles.dayChipText,
                            selectedDay === day.dayOfWeek && styles.dayChipTextActive,
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>

              <PrimaryButton
                label={forkMutation.isPending ? 'Agregando...' : 'Agregar a mi rutina'}
                onPress={handleFork}
                loading={forkMutation.isPending}
                disabled={!selectedDay || forkMutation.isPending}
              />
            </ScrollView>
          )}

          {!successDay && (
            <SecondaryButton label="Cancelar" onPress={onClose} disabled={forkMutation.isPending} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    maxHeight: '85%',
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sheetTitle: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  content: {
    gap: theme.spacing.md,
  },
  routineName: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  exercisesCard: {
    gap: theme.spacing.sm,
  },
  exercisesTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
    marginBottom: theme.spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  exerciseIndex: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    width: 20,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  exerciseSets: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  daySelectorLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
    marginTop: theme.spacing.sm,
  },
  dayChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayChipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  noDaysText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  successState: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  successTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  successText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
});
