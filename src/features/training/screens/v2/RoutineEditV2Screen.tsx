import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Check, Dumbbell, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';
import {
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { TrainingV2EmptyState } from './TrainingV2States';
import {
  useRoutineDetail,
  useRoutines,
  useUpdateRoutineName,
  useActivateRoutine,
  useDeactivateRoutine,
} from '@/features/training/hooks/use-routines';
import { useTrainingStrategies } from '@/features/training/hooks/use-training-strategies';
import { useSetRoutineStrategy } from '@/features/training/hooks/use-set-routine-strategy';
import { TrainingStrategySelector } from '@/features/training/components/TrainingStrategySelector';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { TrainingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'RoutineEdit'>;

export default function RoutineEditV2Screen({ navigation, route }: Props) {
  const { id: routineId } = route.params;

  const { data: routine, isLoading, isError, refetch } = useRoutineDetail(routineId);
  const { data: allRoutines } = useRoutines();
  const { data: strategies } = useTrainingStrategies();
  const updateNameMutation = useUpdateRoutineName();
  const activateMutation = useActivateRoutine();
  const deactivateMutation = useDeactivateRoutine();
  const setStrategyMutation = useSetRoutineStrategy();

  const [name, setName] = React.useState('');
  const [isActive, setIsActive] = React.useState(false);
  const [trainingStrategyKey, setTrainingStrategyKey] = React.useState<string | null>(null);
  const [newActiveRoutineId, setNewActiveRoutineId] = React.useState<string | null>(null);
  const [initialized, setInitialized] = React.useState(false);

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const infoTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showAddModal, setShowAddModal] = React.useState(false);

  const otherRoutines = React.useMemo(
    () => (allRoutines ?? []).filter((r) => r.id !== routineId),
    [allRoutines, routineId],
  );

  const routineDays = routine?.days.map((d) => d.dayOfWeek) ?? [];

  React.useEffect(() => {
    if (routine && !initialized) {
      setName(routine.name);
      setIsActive(routine.isActive ?? false);
      setTrainingStrategyKey(routine.trainingStrategyKey ?? null);
      setInitialized(true);
    }
  }, [routine, initialized]);

  React.useEffect(() => {
    return () => {
      if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
    };
  }, []);



  const nameChanged = routine && name !== routine.name;
  const activeChanged = routine && isActive !== (routine.isActive ?? false);
  const strategyChanged = routine && trainingStrategyKey !== (routine.trainingStrategyKey ?? null);
  const deactivating = activeChanged && !isActive;
  const canSave =
    name.trim().length > 0 &&
    (!deactivating || newActiveRoutineId !== null) &&
    (nameChanged || activeChanged || strategyChanged);

  const handleSave = async () => {
    if (!routine || !canSave) return;
    setIsSaving(true);
    setSaveError(null);

    const mutations: Promise<unknown>[] = [];
    if (nameChanged) {
      mutations.push(updateNameMutation.mutateAsync({ id: routineId, name: name.trim() }));
    }
    if (activeChanged) {
      if (isActive) {
        mutations.push(activateMutation.mutateAsync(routineId));
      } else if (newActiveRoutineId) {
        mutations.push(deactivateMutation.mutateAsync(routineId));
        mutations.push(activateMutation.mutateAsync(newActiveRoutineId));
      }
    }
    if (strategyChanged) {
      mutations.push(
        setStrategyMutation.mutateAsync({ routineId, strategyKey: trainingStrategyKey }),
      );
    }

    try {
      await Promise.all(mutations);
      await refetch();
      navigation.goBack();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!routine) return;
    const dayOfWeek = routine.days.find((d) =>
      d.exercises.some((e) => e.id === exerciseId),
    )?.dayOfWeek;
    if (!dayOfWeek) return;
    try {
      await apiClient.del(
        API_ENDPOINTS.routines.removeExercise(routineId, dayOfWeek, exerciseId),
      );
      await refetch();
    } catch {
      Alert.alert('Error', 'No se pudo eliminar el ejercicio.');
    }
  };

  if (isLoading) {
    return (
      <TrainingV2Screen title="Editar rutina" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando rutina...</Text>
        </View>
      </TrainingV2Screen>
    );
  }

  if (isError || !routine) {
    return (
      <TrainingV2Screen title="Editar rutina" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
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

  return (
    <TrainingV2Screen
      title="Editar rutina"
      titleColor={theme.colors.textPrimary}
      subtitle={routine.name}
      onBack={navigation.goBack}
      footer={
        <PrimaryButton
          label="Guardar cambios"
          onPress={handleSave}
          loading={isSaving}
          disabled={!canSave || isSaving}
        />
      }
    >
      <View style={styles.section}>
        <TextInput
          label="Nombre de la rutina"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Push Pull Legs"
          maxLength={50}
          autoCapitalize="sentences"
        />
      </View>

      <View style={styles.section}>
        <BaseCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Rutina activa</Text>
              <Text style={styles.statusDescription}>
                {isActive
                  ? 'Esta es la rutina que se usara para entrenar.'
                  : 'Activala para poder entrenar con ella.'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={(val) => {
                if (!val && otherRoutines.length === 0) {
                  if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
                  setInfoMessage('No puedes desactivar la rutina activa sin tener otra rutina. Crea una nueva rutina primero.');
                  infoTimeoutRef.current = setTimeout(() => setInfoMessage(null), 3500);
                  return;
                }
                setIsActive(val);
                if (!val) setNewActiveRoutineId(null);
              }}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryMuted }}
              thumbColor={isActive ? theme.colors.primary : theme.colors.textMuted}
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
      </View>

      <View style={styles.section}>
        <TrainingStrategySelector
          strategies={strategies ?? []}
          selectedKey={trainingStrategyKey}
          onSelect={setTrainingStrategyKey}
        />
      </View>

      <View style={styles.section}>
        <TrainingV2SectionHeader
          title="Ejercicios"
          actionLabel="+"
          onAction={() => setShowAddModal(true)}
        />

        {allExercises.length === 0 ? (
          <TrainingV2EmptyState
            title="Sin ejercicios"
            description="Agrega ejercicios desde el catalogo o crealos manualmente."
            actionLabel="Agregar ejercicio"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          routine.days.map((day) => (
            <View key={day.dayOfWeek} style={styles.dayGroup}>
              <TrainingV2Tag
                label={DAY_OF_WEEK_LABELS[day.dayOfWeek] ?? day.dayOfWeek}
                tone="primary"
              />
              {day.exercises.map((ex) => (
                <BaseCard key={ex.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseIcon}>
                    <Dumbbell size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteExercise(ex.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                </BaseCard>
              ))}
            </View>
          ))
        )}
      </View>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.choiceCard}>
            <Text style={styles.choiceTitle}>Agregar ejercicio</Text>
            <TouchableOpacity
              style={styles.choiceBtn}
              onPress={() => {
                setShowAddModal(false);
                const firstDay = routineDays[0];
                navigation.navigate('ExerciseCatalog', {
                  routineId,
                  selectedDay: firstDay ?? undefined,
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
                  routineId,
                  selectedDay: routineDays[0] ?? undefined,
                });
              }}
            >
              <Text style={styles.choiceBtnIcon}>✏️</Text>
              <Text style={styles.choiceBtnText}>Manual</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>



      {saveError ? (
        <BaseCard style={styles.errorCard}>
          <AlertCircle size={18} color={theme.colors.error} />
          <Text style={styles.errorText}>{saveError}</Text>
        </BaseCard>
      ) : null}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  centerTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.heading2.fontSize, lineHeight: theme.typography.heading2.lineHeight, fontWeight: theme.typography.heading2.fontWeight, textAlign: 'center' },
  centerText: { color: theme.colors.textSecondary, fontSize: theme.typography.body.fontSize, lineHeight: theme.typography.body.lineHeight, textAlign: 'center' },
  section: { marginBottom: theme.spacing.xl },
  statusCard: { gap: theme.spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.lg },
  statusInfo: { flex: 1, gap: theme.spacing.xxs },
  statusLabel: { color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, lineHeight: theme.typography.bodyStrong.lineHeight, fontWeight: theme.typography.bodyStrong.fontWeight },
  statusDescription: { color: theme.colors.textSecondary, fontSize: theme.typography.small.fontSize, lineHeight: theme.typography.small.lineHeight },
  otherRoutines: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
  otherRoutinesTitle: { color: theme.colors.textSecondary, fontSize: theme.typography.small.fontSize, lineHeight: theme.typography.small.lineHeight, fontWeight: '600' },
  otherRoutinesEmpty: { color: theme.colors.textMuted, fontSize: theme.typography.small.fontSize, lineHeight: theme.typography.small.lineHeight, fontStyle: 'italic' },
  otherRoutineItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  otherRoutineItemSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryMuted },
  otherRoutineInfo: { flex: 1, gap: 2 },
  otherRoutineName: { color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, lineHeight: theme.typography.bodyStrong.lineHeight, fontWeight: theme.typography.bodyStrong.fontWeight },
  otherRoutineMeta: { color: theme.colors.textSecondary, fontSize: theme.typography.caption.fontSize, lineHeight: theme.typography.caption.lineHeight },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.colors.border },
  radioSelected: { width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  dayGroup: { marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md },
  exerciseIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  exerciseName: { flex: 1, color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, lineHeight: theme.typography.bodyStrong.lineHeight, fontWeight: theme.typography.bodyStrong.fontWeight },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay, padding: theme.spacing.xl },
  choiceCard: { width: '100%', maxWidth: 320, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, gap: theme.spacing.md },
  choiceTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.heading3.fontSize, lineHeight: theme.typography.heading3.lineHeight, fontWeight: theme.typography.heading3.fontWeight, textAlign: 'center' },
  choiceBtn: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated },
  choiceBtnIcon: { fontSize: 22 },
  choiceBtnText: { color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, lineHeight: theme.typography.bodyStrong.lineHeight, fontWeight: '600' },
  manualOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay },
  manualSheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.lg, gap: theme.spacing.md, maxHeight: '90%' },

  manualTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.heading3.fontSize, lineHeight: theme.typography.heading3.lineHeight, fontWeight: theme.typography.heading3.fontWeight, textAlign: 'center' },
  manualInput: { minHeight: 52, color: theme.colors.textPrimary, backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, fontSize: theme.typography.body.fontSize, lineHeight: theme.typography.body.lineHeight },
  manualDayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  manualDayLabel: { color: theme.colors.textSecondary, fontSize: theme.typography.body.fontSize, lineHeight: theme.typography.body.lineHeight },
  addDayBtn: { minHeight: 36, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  addDayBtnText: { color: theme.colors.primary, fontSize: theme.typography.small.fontSize, fontWeight: '700' },
  manualDayChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  dayChipActive: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radius.full, backgroundColor: theme.colors.primary, borderWidth: 1, borderColor: theme.colors.primary },
  dayChipTextActive: { color: theme.colors.background, fontSize: theme.typography.body.fontSize, fontWeight: '600' },
  setsLabel: { color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, lineHeight: theme.typography.bodyStrong.lineHeight, fontWeight: theme.typography.bodyStrong.fontWeight },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  setNumber: { color: theme.colors.textMuted, fontSize: theme.typography.caption.fontSize, fontWeight: '700', width: 24 },
  setInput: { flex: 1, minHeight: 44, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated, color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, fontWeight: '700', textAlign: 'center', paddingHorizontal: theme.spacing.sm },
  setSign: { color: theme.colors.textMuted, fontSize: theme.typography.bodyStrong.fontSize, fontWeight: '700' },
  addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, minHeight: 44, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.primary, borderStyle: 'dashed', backgroundColor: `${theme.colors.primary}08` },
  addSetBtnLabel: { color: theme.colors.primary, fontSize: theme.typography.bodyStrong.fontSize, fontWeight: '700' },
  saveBtn: { marginTop: theme.spacing.sm },
  pickerCard: { width: '100%', maxWidth: 340, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, gap: theme.spacing.md },
  pickerTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.heading3.fontSize, lineHeight: theme.typography.heading3.lineHeight, fontWeight: theme.typography.heading3.fontWeight, textAlign: 'center' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' },
  pickerChip: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border, minWidth: 80, alignItems: 'center' },
  pickerChipText: { color: theme.colors.textPrimary, fontSize: theme.typography.bodyStrong.fontSize, fontWeight: '700' },
  pickerEmpty: { color: theme.colors.textMuted, fontSize: theme.typography.body.fontSize, textAlign: 'center' },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.surface, borderColor: theme.colors.error, borderWidth: 1 },
  errorText: { flex: 1, color: theme.colors.error, fontSize: theme.typography.small.fontSize, lineHeight: theme.typography.small.lineHeight },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.surface, borderColor: theme.colors.warning, borderWidth: 1 },
  infoText: { flex: 1, color: theme.colors.warning, fontSize: theme.typography.small.fontSize, lineHeight: theme.typography.small.lineHeight },
});
