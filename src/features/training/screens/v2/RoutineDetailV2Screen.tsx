import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { AlertCircle, Check, Clock3, Dumbbell, Pencil, Play, Plus, Rows3, Star, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { DragIndicator } from '@/components/ui/DragIndicator';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { TrainingV2EmptyState } from './TrainingV2States';
import {
  useRoutineDetail,
  useRemoveRoutineDay,
  useRoutines,
  useUpdateRoutineName,
  useActivateRoutine,
  useDeactivateRoutine,
} from '@/features/training/hooks/use-routines';
import { useSyncRoutine } from '@/features/training/hooks/use-sync-routine';
import { useTrainingStrategies } from '@/features/training/hooks/use-training-strategies';
import { useSetRoutineStrategy } from '@/features/training/hooks/use-set-routine-strategy';
import { TrainingStrategySelector } from '@/features/training/components/TrainingStrategySelector';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { SwipeableExerciseCard } from '@/features/training/components/SwipeableExerciseCard';
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_ORDER } from '@/features/training/types/routine';
import type { ExerciseConfig } from '@/features/training/types/routine';
import type { DayOfWeek } from '@/features/training/types/routine';
import type { TrainingStackParamList } from '@/navigation/types';
import type { UserDrawerParamList } from '@/features/user/types/user-navigation.types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'RoutineDetail'>;

function setsCount(exercise: ExerciseConfig): number {
  return Array.isArray(exercise.sets) ? exercise.sets.length : exercise.sets;
}

function totalSetsCount(exercises: ExerciseConfig[]): number {
  return exercises.reduce((sum, ex) => sum + setsCount(ex), 0);
}

const ALL_DAYS = DAY_OF_WEEK_ORDER;

export default function RoutineDetailV2Screen({ navigation, route }: Props) {
  const { data: routine, isLoading, isError, refetch } = useRoutineDetail(route.params.id);
  const syncRoutineMutation = useSyncRoutine();
  const removeDayMutation = useRemoveRoutineDay(route.params.id);

  const { data: allRoutines } = useRoutines();
  const { data: strategies } = useTrainingStrategies();
  const updateNameMutation = useUpdateRoutineName();
  const activateMutation = useActivateRoutine();
  const deactivateMutation = useDeactivateRoutine();
  const setStrategyMutation = useSetRoutineStrategy();

  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showAddDayModal, setShowAddDayModal] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  const [isAddingDay, setIsAddingDay] = React.useState(false);

  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editIsActive, setEditIsActive] = React.useState(false);
  const [editStrategyKey, setEditStrategyKey] = React.useState<string | null>(null);
  const [newActiveRoutineId, setNewActiveRoutineId] = React.useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const [editSaveError, setEditSaveError] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (routine && !selectedDay) {
      const jsDay = new Date().getDay();
      const JS_TO_DAY: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayDayOfWeek = JS_TO_DAY[jsDay];
      const hasToday = routine.days.some((d) => d.dayOfWeek === todayDayOfWeek);
      setSelectedDay(hasToday ? todayDayOfWeek : (routine.days[0]?.dayOfWeek ?? null));
    }
  }, [routine, selectedDay]);

  const openWorkoutStart = () => {
    const drawer = navigation.getParent()?.getParent<DrawerNavigationProp<UserDrawerParamList>>();
    drawer?.navigate('WorkoutStack', { screen: 'WorkoutStart' });
  };

  const routineDays = routine?.days.map((d) => d.dayOfWeek) ?? [];
  const missingDays = ALL_DAYS.filter((day) => !routineDays.includes(day));

  const otherRoutines = React.useMemo(
    () => (allRoutines ?? []).filter((r) => r.id !== route.params.id),
    [allRoutines, route.params.id],
  );

  const openEditSheet = () => {
    if (!routine) return;
    setEditName(routine.name);
    setEditIsActive(routine.isActive ?? false);
    setEditStrategyKey(routine.trainingStrategyKey ?? null);
    setNewActiveRoutineId(null);
    setEditSaveError(null);
    setShowEditModal(true);
  };

  const nameChanged = routine && editName !== routine.name;
  const activeChanged = routine && editIsActive !== (routine.isActive ?? false);
  const strategyChanged = routine && editStrategyKey !== (routine.trainingStrategyKey ?? null);
  const deactivating = activeChanged && !editIsActive;
  const canSaveEdit =
    editName.trim().length > 0 &&
    (!deactivating || newActiveRoutineId !== null) &&
    (nameChanged || activeChanged || strategyChanged);

  const handleSaveEdit = async () => {
    if (!routine || !canSaveEdit) return;
    setIsSavingEdit(true);
    setEditSaveError(null);

    const mutations: Promise<unknown>[] = [];
    if (nameChanged) {
      mutations.push(updateNameMutation.mutateAsync({ id: routine.id, name: editName.trim() }));
    }
    if (activeChanged) {
      if (editIsActive) {
        mutations.push(activateMutation.mutateAsync(routine.id));
      } else if (newActiveRoutineId) {
        mutations.push(deactivateMutation.mutateAsync(routine.id));
        mutations.push(activateMutation.mutateAsync(newActiveRoutineId));
      }
    }
    if (strategyChanged) {
      mutations.push(
        setStrategyMutation.mutateAsync({ routineId: routine.id, strategyKey: editStrategyKey }),
      );
    }

    try {
      await Promise.all(mutations);
      await refetch();
      setShowEditModal(false);
    } catch (err) {
      setEditSaveError(err instanceof Error ? err.message : 'Error al guardar los cambios');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAddDay = async (dayOfWeek: DayOfWeek) => {
    if (!routine) return;
    setIsAddingDay(true);
    syncRoutineMutation.mutate(
      { routineId: routine.id, days: [{ dayOfWeek, exercises: [] }] },
      {
        onSuccess: () => {
          setIsAddingDay(false);
          setShowAddDayModal(false);
          refetch();
        },
        onError: () => {
          setIsAddingDay(false);
        },
      },
    );
  };

  const handleRemoveDay = () => {
    if (!routine || !selectedDay) return;
    setShowConfirmDelete(false);
    removeDayMutation.mutate(
      { dayOfWeek: selectedDay },
      {
        onSuccess: () => {
          const remainingDays = routine.days.filter((d) => d.dayOfWeek !== selectedDay);
          if (remainingDays.length > 0) {
            setSelectedDay(remainingDays[0].dayOfWeek);
          } else {
            setSelectedDay(null);
          }
        },
      },
    );
  };

  const handleDeleteExercise = (exerciseId: string, exerciseName: string) => {
    if (!routine || !selectedDay) return;

    Alert.alert(
      '¿Eliminar ejercicio?',
      `¿Estás seguro de que deseas eliminar "${exerciseName}" de esta rutina?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.del(
                API_ENDPOINTS.routines.removeExercise(routine.id, selectedDay, exerciseId)
              );
              refetch();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el ejercicio. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <TrainingV2Screen title="Detalle de rutina" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando rutina...</Text>
        </View>
      </TrainingV2Screen>
    );
  }

  if (isError || !routine) {
    return (
      <TrainingV2Screen title="Detalle de rutina" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
        <View style={styles.center}>
          <AlertCircle size={44} color={theme.colors.error} />
          <Text style={styles.centerTitle}>No pudimos cargar la rutina</Text>
          <Text style={styles.centerText}>Revisa tu conexion e intenta nuevamente.</Text>
          <SecondaryButton label="Reintentar" onPress={() => refetch()} />
        </View>
      </TrainingV2Screen>
    );
  }

  const allExercises = routine.days.flatMap((d) => d.exercises);
  const exerciseCount = allExercises.length;
  const totalSets = totalSetsCount(allExercises);
  const selectedDayExercises = routine.days.find((d) => d.dayOfWeek === selectedDay)?.exercises ?? [];
  const currentStrategyName = strategies?.find((s) => s.key === routine.trainingStrategyKey)?.name ?? 'Personalizada';

  return (
    <View style={styles.screenRoot}>
      <TrainingV2Screen
        title="Rutina"
        titleColor={theme.colors.textPrimary}
        onBack={navigation.goBack}
        footer={
          <PrimaryButton
            label="Empezar entrenamiento"
            onPress={openWorkoutStart}
            icon={<Play size={18} color={theme.colors.background} />}
          />
        }
      >
        <View style={styles.headerContainerCentred}>
          {routine.isActive ? (
            <View style={styles.activeStarContainer}>
              <Star size={26} color="#FACC15" fill="#FACC15" />
            </View>
          ) : null}
          <Text style={styles.centredTitle}>{routine.name}</Text>
          {routine.description ? (
            <Text style={styles.centredDescription}>{routine.description}</Text>
          ) : null}
          <TouchableOpacity onPress={openEditSheet} style={styles.editSettingsBtn} activeOpacity={0.78}>
            <Pencil size={13} color={theme.colors.primary} />
            <Text style={styles.editSettingsBtnText}>Ajustes de rutina</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaGrid}>
          <TrainingV2FieldPreview label="Tipo" value={currentStrategyName} helper="Planificación" />
          <TrainingV2FieldPreview label="Volumen" value={`${totalSets} series`} helper="Carga de series" />
        </View>

        <TrainingV2SectionHeader
          title="Ejercicios"
          actionLabel="Agregar"
          onAction={() => setShowAddModal(true)}
        />

        <View style={styles.dayTabsWrapper}>
          {routine.days.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayTabsRow}
            >
              {routine.days.map((day) => {
                const isActive = day.dayOfWeek === selectedDay;
                return (
                  <TouchableOpacity
                    key={day.dayOfWeek}
                    activeOpacity={0.78}
                    onPress={() => setSelectedDay(day.dayOfWeek)}
                    style={[styles.dayTab, isActive && styles.dayTabActive]}
                  >
                    <Text style={[styles.dayTabText, isActive && styles.dayTabTextActive]}>
                      {DAY_OF_WEEK_LABELS[day.dayOfWeek]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {missingDays.length > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.78}
                  style={styles.addDayFab}
                  onPress={() => setShowAddDayModal(true)}
                  accessibilityLabel="Agregar dia"
                >
                  <Plus size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          ) : null}
        </View>

        {selectedDayExercises.length === 0 ? (
          <View style={styles.emptyDayWrap}>
            <TrainingV2EmptyState
              title="Sin ejercicios en este dia"
              description="Agrega ejercicios desde el catalogo para este dia."
              actionLabel="Agregar ejercicio"
              onAction={() => setShowAddModal(true)}
            />
            {routine.days.length > 1 ? (
              <TouchableOpacity
                style={styles.deleteDayBtn}
                onPress={() => setShowConfirmDelete(true)}
                activeOpacity={0.78}
              >
                <Trash2 size={16} color={theme.colors.error} />
                <Text style={styles.deleteDayBtnText}>Eliminar dia</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.exerciseList}>
            {selectedDayExercises.map((exercise) => (
              <SwipeableExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPress={() =>
                  navigation.navigate('ExerciseDetail', {
                    routineId: routine.id,
                    exercise,
                  })
                }
                onDelete={() => handleDeleteExercise(exercise.id, exercise.name)}
              />
            ))}
          </View>
        )}

        <BaseCard style={styles.noteCard}>
          <Clock3 size={20} color={theme.colors.textSecondary} />
          <Text style={styles.noteText}>Cada ejercicio tiene {totalSets} series en total. Descansa 90 segundos entre cada una.</Text>
          <Pencil size={18} color={theme.colors.textMuted} />
        </BaseCard>

        <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
            <Pressable style={styles.choiceCard}>
              <Text style={styles.choiceTitle}>Agregar ejercicio</Text>
              <TouchableOpacity
                style={styles.choiceBtn}
                onPress={() => {
                  setShowAddModal(false);
                  navigation.navigate('ExerciseCatalog', {
                    routineId: routine.id,
                    selectedDay: selectedDay ?? undefined,
                  });
                }}
              >
                <Text style={styles.choiceBtnIcon}>📋</Text>
                <Text style={styles.choiceBtnText}>Del catalogo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.choiceBtn}
                onPress={() => {
                  setShowAddModal(false);
                  navigation.navigate('ManualExercise', {
                    routineId: routine.id,
                    selectedDay: selectedDay ?? undefined,
                  });
                }}
              >
                <Text style={styles.choiceBtnIcon}>✏️</Text>
                <Text style={styles.choiceBtnText}>Manual</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </TrainingV2Screen>

      <Modal visible={showAddDayModal} transparent animationType="fade" onRequestClose={() => setShowAddDayModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddDayModal(false)}>
          <Pressable style={styles.choiceCard}>
            <Text style={styles.choiceTitle}>Agregar dia</Text>
            <Text style={styles.choiceSubtitle}>Selecciona un dia que no este en la rutina.</Text>
            <View style={styles.modalDayGrid}>
              {missingDays.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={styles.modalDayChip}
                  onPress={() => handleAddDay(day)}
                  disabled={isAddingDay}
                >
                  <Text style={styles.modalDayChipText}>{DAY_OF_WEEK_LABELS[day]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isAddingDay ? (
              <View style={styles.addingDayRow}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.addingDayText}>Agregando dia...</Text>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showConfirmDelete} transparent animationType="fade" onRequestClose={() => setShowConfirmDelete(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowConfirmDelete(false)}>
          <Pressable style={styles.choiceCard}>
            <Text style={styles.choiceTitle}>Eliminar dia</Text>
            <Text style={styles.choiceSubtitle}>
              {selectedDay
                ? `Se eliminara "${DAY_OF_WEEK_LABELS[selectedDay]}" de la rutina. Esta accion no se puede deshacer.`
                : 'Selecciona un dia para eliminar.'}
            </Text>
            <View style={styles.confirmActions}>
              <SecondaryButton
                label="Cancelar"
                onPress={() => setShowConfirmDelete(false)}
                disabled={removeDayMutation.isPending}
                style={styles.confirmBtn}
              />
              <PrimaryButton
                label={removeDayMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                onPress={handleRemoveDay}
                loading={removeDayMutation.isPending}
                disabled={removeDayMutation.isPending}
                style={styles.confirmBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
          <Pressable style={styles.editSheet}>
            <DragIndicator position="inside" />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Editar rutina</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.closeBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.editField}>
                <TextInput
                  label="Nombre de la rutina"
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Ej: Push Pull Legs"
                  maxLength={50}
                  autoCapitalize="sentences"
                />
              </View>

              <BaseCard style={styles.statusCard}>
                <View style={styles.statusRow}>
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusLabel}>Rutina activa</Text>
                    <Text style={styles.statusDescription}>
                      {editIsActive
                        ? 'Esta es la rutina que se usara para entrenar.'
                        : 'Activala para poder entrenar con ella.'}
                    </Text>
                  </View>
                  <Switch
                    value={editIsActive}
                    onValueChange={(val) => {
                      if (!val && otherRoutines.length === 0) {
                        setInfoMessage('No puedes desactivar la rutina activa sin tener otra rutina. Crea una nueva rutina primero.');
                        setTimeout(() => setInfoMessage(null), 3500);
                        return;
                      }
                      setEditIsActive(val);
                      if (!val) setNewActiveRoutineId(null);
                    }}
                    trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryMuted }}
                    thumbColor={editIsActive ? theme.colors.primary : theme.colors.textMuted}
                  />
                </View>
              </BaseCard>

              {deactivating && (
                <View style={styles.otherRoutines}>
                  <Text style={styles.otherRoutinesTitle}>Selecciona la rutina que sera activa</Text>
                  {otherRoutines.length === 0 ? (
                    <Text style={styles.otherRoutinesEmpty}>No tienes otras rutinas.</Text>
                  ) : (
                    otherRoutines.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        activeOpacity={0.7}
                        style={[styles.otherRoutineItem, newActiveRoutineId === r.id && styles.otherRoutineItemSelected]}
                        onPress={() => setNewActiveRoutineId(r.id)}
                      >
                        <View style={styles.otherRoutineInfo}>
                          <Text style={styles.otherRoutineName}>{r.name}</Text>
                          <Text style={styles.otherRoutineMeta}>{r.dayOfWeeks.length} dias</Text>
                        </View>
                        {newActiveRoutineId === r.id ? (
                          <View style={styles.radioSelected}><Check size={16} color={theme.colors.background} /></View>
                        ) : (
                          <View style={styles.radio} />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {infoMessage ? (
                <BaseCard style={styles.infoCard}>
                  <AlertCircle size={18} color={theme.colors.warning} />
                  <Text style={styles.infoText}>{infoMessage}</Text>
                </BaseCard>
              ) : null}

              <View style={styles.editField}>
                <TrainingStrategySelector
                  strategies={strategies ?? []}
                  selectedKey={editStrategyKey}
                  onSelect={setEditStrategyKey}
                />
              </View>

              {editSaveError ? (
                <BaseCard style={styles.errorCard}>
                  <AlertCircle size={18} color={theme.colors.error} />
                  <Text style={styles.errorText}>{editSaveError}</Text>
                </BaseCard>
              ) : null}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <PrimaryButton
                label="Guardar cambios"
                onPress={handleSaveEdit}
                loading={isSavingEdit}
                disabled={!canSaveEdit || isSavingEdit}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  heroWrap: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroGradient: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.primaryMuted,
  },
  heroContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  heroDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  summaryCard: {
    gap: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextWrap: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  summaryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  dayTabsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dayTabsRow: {
    gap: theme.spacing.sm,
  },
  dayTab: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTabActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  dayTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  dayTabTextActive: {
    color: theme.colors.primary,
  },
  addDayFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: `${theme.colors.primary}08`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDayWrap: {
    gap: theme.spacing.md,
  },
  deleteDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    minHeight: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: `${theme.colors.error}10`,
  },
  deleteDayBtnText: {
    color: theme.colors.error,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  exerciseList: {
    gap: theme.spacing.sm,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseBody: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  exerciseStats: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  exerciseStatsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  noteText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footerActions: { flexDirection: 'row', gap: theme.spacing.md },
  footerButton: { flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay, padding: theme.spacing.xl },
  choiceCard: { width: '100%', maxWidth: 320, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, gap: theme.spacing.md },
  choiceTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.heading3.fontSize, lineHeight: theme.typography.heading3.lineHeight, fontWeight: theme.typography.heading3.fontWeight, textAlign: 'center' },
  choiceBtn: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated },
  choiceBtnIcon: { fontSize: 22 },
  choiceBtnText: { color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, lineHeight: theme.typography.bodyStrong.lineHeight, fontWeight: '600' },
  choiceSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  modalDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  modalDayChip: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  modalDayChipText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: '700',
  },
  addingDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  addingDayText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  confirmBtn: {
    flex: 1,
  },
  editSheet: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 20,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  closeBtnText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: '600',
  },
  sheetContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  editField: {
    width: '100%',
  },
  sheetFooter: {
    marginTop: theme.spacing.md,
  },
  statusCard: {
    gap: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  statusInfo: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  statusLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  statusDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  otherRoutines: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  otherRoutinesTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  otherRoutinesEmpty: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontStyle: 'italic',
  },
  otherRoutineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  otherRoutineItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  otherRoutineInfo: {
    flex: 1,
    gap: 2,
  },
  otherRoutineName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  otherRoutineMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.warning,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    color: theme.colors.warning,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  headerContainerCentred: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  activeStarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  centredTitle: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  centredSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  centredDescription: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'center',
    marginTop: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.lg,
  },
  editSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs - 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xs,
  },
  editSettingsBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
