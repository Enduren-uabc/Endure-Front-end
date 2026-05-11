import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import {
  useRoutineDetail,
  useActivateRoutine,
  useDeactivateRoutine,
  useDeleteRoutine,
} from '@/features/training/hooks/use-routines';
import type { TrainingStackParamList } from '@/navigation/types';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_ORDER,
  type DayOfWeek,
} from '@/features/training/types/routine';

export default function RoutineDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TrainingStackParamList>>();
  const route = useRoute<RouteProp<TrainingStackParamList, 'RoutineDetail'>>();
  const { id } = route.params;

  const { data: routine, isLoading } = useRoutineDetail(id);
  const activateMutation = useActivateRoutine();
  const deactivateMutation = useDeactivateRoutine();
  const deleteMutation = useDeleteRoutine();

  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  React.useEffect(() => {
    if (routine && (routine.dayOfWeeks ?? []).length > 0 && !selectedDay) {
      setSelectedDay(routine.dayOfWeeks[0]);
    }
  }, [routine, selectedDay]);

  const handleActivate = () => {
    activateMutation.mutate(id);
  };

  const handleDeactivate = () => {
    deactivateMutation.mutate(id);
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  };

  const currentDayExercises =
    (routine?.days ?? []).find((d) => d.dayOfWeek === selectedDay)?.exercises ?? [];

  const sortedDays = [...(routine?.dayOfWeeks ?? [])].sort(
    (a, b) => DAY_OF_WEEK_ORDER.indexOf(a) - DAY_OF_WEEK_ORDER.indexOf(b),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{routine?.name ?? 'Rutina'}</Text>
          {routine?.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVA</Text>
            </View>
          )}
        </View>
        <View style={styles.backButton} />
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {!isLoading && routine && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Day selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysRow}
          >
            {sortedDays.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.dayTab,
                  selectedDay === day && styles.dayTabSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayTabText,
                    selectedDay === day && styles.dayTabTextSelected,
                  ]}
                >
                  {DAY_OF_WEEK_LABELS[day]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercises for selected day */}
          <View style={styles.exercisesSection}>
            {currentDayExercises.length === 0 ? (
              <BaseCard>
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>
                    No hay ejercicios para este día
                  </Text>
                  <Text style={styles.emptyDaySub}>
                    Ve a "Editar ejercicios" para agregarlos
                  </Text>
                </View>
              </BaseCard>
            ) : (
              [...currentDayExercises]
                .sort((a, b) => a.order - b.order)
                .map((exercise) => (
                  <BaseCard key={exercise.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseRow}>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseMeta}>
                          {exercise.sets} sets × {exercise.repsPerSet} reps
                          {exercise.weight > 0 ? ` @ ${exercise.weight}kg` : ''}
                        </Text>
                      </View>
                      <ChevronRight size={20} color={theme.colors.textMuted} />
                    </View>
                  </BaseCard>
                ))
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <PrimaryButton
              label="Editar ejercicios"
              onPress={() => navigation.navigate('RoutineBuilder', { id })}
            />

            {routine.isActive ? (
              <SecondaryButton
                label="Desactivar rutina"
                onPress={handleDeactivate}
                disabled={deactivateMutation.isPending}
              />
            ) : (
              <SecondaryButton
                label="Activar rutina"
                onPress={handleActivate}
                disabled={activateMutation.isPending}
              />
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Trash2 size={18} color={theme.colors.error} />
              <Text style={styles.deleteText}>Eliminar rutina</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Delete confirmation modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BaseCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Eliminar rutina?</Text>
            <Text style={styles.modalText}>
              Esta acción no se puede deshacer. Se eliminará "{routine?.name}" y todos sus ejercicios.
            </Text>
            <View style={styles.modalButtons}>
              <SecondaryButton
                label="Cancelar"
                onPress={() => setShowDeleteModal(false)}
              />
              <PrimaryButton
                label="Eliminar"
                onPress={handleDelete}
                loading={deleteMutation.isPending}
                disabled={deleteMutation.isPending}
              />
            </View>
          </BaseCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  daysRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  dayTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  dayTabSelected: {
    backgroundColor: `${theme.colors.primary}33`,
    borderColor: theme.colors.primary,
  },
  dayTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '500',
  },
  dayTabTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  exercisesSection: {
    gap: theme.spacing.md,
  },
  exerciseCard: {
    padding: theme.spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  exerciseMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  emptyDayText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  emptyDaySub: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  deleteText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    gap: theme.spacing.md,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  modalText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  modalButtons: {
    gap: theme.spacing.md,
  },
});
