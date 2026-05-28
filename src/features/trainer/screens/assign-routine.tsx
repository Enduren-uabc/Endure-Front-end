import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Lock,
  Search,
  X,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { DragIndicator } from '@/components/ui/DragIndicator';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useLinkedClients } from '@/features/trainer-link/hooks/use-trainer-link';
import {
  useAssignRoutine,
  useClientAssignedRoutines,
  useReplaceRoutine,
} from '@/features/trainer-link/hooks/use-assigned-routines';
import { useRoutines } from '@/features/training/hooks/use-routines';
import {
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { theme } from '@/theme';
import type { TrainerRoutineOption } from '../types/trainer-clients';
import {
  buildDemoRoutineOptions,
  buildRoutineOption,
  buildTrainerClientViewModel,
} from './trainer-clients.mock';

type AssignRoutineParams = {
  clientId: string;
  clientName: string;
  linkId?: string;
  activatedAt?: string;
  preselectedRoutineId?: string;
  preselectedRoutineName?: string;
};

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ AssignRoutine: AssignRoutineParams }, 'AssignRoutine'>;
};

export default function AssignRoutineScreen({ navigation, route }: Props) {
  const params = route.params;
  const client = React.useMemo(() => buildTrainerClientViewModel(params), [params]);
  const routinesQuery = useRoutines();
  const linkedClients = useLinkedClients();
  const assignedRoutinesQuery = useClientAssignedRoutines(params.clientId);
  const assignMutation = useAssignRoutine(params.clientId);
  const currentAssignment = assignedRoutinesQuery.data?.[0] ?? null;
  const replaceMutation = useReplaceRoutine(
    params.clientId,
    currentAssignment?.id ?? '',
  );
  const [query, setQuery] = React.useState('');
  const [selectedRoutineId, setSelectedRoutineId] = React.useState<string | null>(
    currentAssignment?.routineId ?? params.preselectedRoutineId ?? null,
  );
  const [note, setNote] = React.useState(currentAssignment?.notes ?? '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [mutationError, setMutationError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [discardVisible, setDiscardVisible] = React.useState(false);

  const demoRoutineOptions = React.useMemo(
    () => buildDemoRoutineOptions(params.linkId),
    [params.linkId],
  );
  const routineOptions = React.useMemo(() => {
    const realOptions = (routinesQuery.data ?? []).map(buildRoutineOption);

    return realOptions.length > 0 ? realOptions : demoRoutineOptions;
  }, [demoRoutineOptions, routinesQuery.data]);
  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return routineOptions.filter((option) =>
      option.routine.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query, routineOptions]);
  const preselectedFallback: TrainerRoutineOption | null =
    selectedRoutineId === params.preselectedRoutineId && params.preselectedRoutineName
      ? {
          routine: {
            id: params.preselectedRoutineId,
            name: params.preselectedRoutineName,
            description: 'Rutina seleccionada desde la biblioteca visual del entrenador.',
            dayOfWeeks: [],
            days: [],
          },
          exerciseCount: 0,
          dayLabels: [],
        }
      : null;
  const selectedOption =
    routineOptions.find((option) => option.routine.id === selectedRoutineId) ??
    preselectedFallback;
  const isStillLinked =
    linkedClients.data?.items.some((item) => item.linkId === params.linkId) ?? true;
  const hasUnsavedChanges =
    selectedRoutineId !== (currentAssignment?.routineId ?? params.preselectedRoutineId ?? null) ||
    note.trim() !== (currentAssignment?.notes ?? '');
  const canSubmit =
    Boolean(selectedOption) &&
    !isSubmitting &&
    (!currentAssignment || hasUnsavedChanges);
  const screenTitle = currentAssignment ? 'Gestionar rutina' : 'Asignar rutina';

  const clearFeedback = () => {
    setValidationError(null);
    setMutationError(null);
    setSuccessMessage(null);
  };

  const leaveScreen = () => {
    setDiscardVisible(false);
    navigation.goBack();
  };

  const requestClose = () => {
    if (hasUnsavedChanges && !isSubmitting) {
      setDiscardVisible(true);
      return;
    }

    navigation.goBack();
  };

  const selectRoutine = (option: TrainerRoutineOption) => {
    setSelectedRoutineId(option.routine.id);
    clearFeedback();
  };

  const persistAssignment = async () => {
    if (!selectedOption) {
      setValidationError('Selecciona una rutina para asignar.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      if (currentAssignment) {
        await replaceMutation.mutateAsync({
          newRoutineId: selectedOption.routine.id,
          notes: note.trim() || undefined,
        });
      } else {
        await assignMutation.mutateAsync({
          routineId: selectedOption.routine.id,
          notes: note.trim() || undefined,
        });
      }
      setIsSubmitting(false);
      setConfirmVisible(false);
      setSuccessMessage(
        currentAssignment
          ? 'Rutina reemplazada correctamente.'
          : 'Rutina asignada correctamente al cliente.',
      );
    } catch (error) {
      setIsSubmitting(false);
      setMutationError(
        currentAssignment
          ? 'No pudimos reemplazar la rutina. Intenta de nuevo.'
          : 'No pudimos asignar la rutina. Intenta de nuevo.',
      );
    }
  };

  const submitAssignment = () => {
    if (currentAssignment && !hasUnsavedChanges) {
      setValidationError('Realiza un cambio antes de guardar el reemplazo.');
      return;
    }

    if (currentAssignment && hasUnsavedChanges) {
      setConfirmVisible(true);
      return;
    }

    persistAssignment();
  };

  if (linkedClients.isLoading) {
    return (
      <CenteredState
        icon={<ActivityIndicator color={theme.colors.primary} size="large" />}
        title="Validando vinculo"
        description="Estamos confirmando que este cliente siga vinculado."
      />
    );
  }

  if (assignedRoutinesQuery.isLoading) {
    return (
      <CenteredState
        icon={<ActivityIndicator color={theme.colors.primary} size="large" />}
        title="Cargando asignacion actual"
        description="Estamos verificando si el cliente ya tiene una rutina asignada."
      />
    );
  }

  if (linkedClients.isError) {
    return (
      <CenteredState
        icon={<AlertCircle size={38} color={theme.colors.error} />}
        title="No pudimos validar el cliente"
        description="Revisa tu conexion antes de modificar la rutina asignada."
        actionLabel="Reintentar"
        onAction={() => linkedClients.refetch()}
      />
    );
  }

  if (!isStillLinked) {
    return (
      <CenteredState
        icon={<Lock size={38} color={theme.colors.warning} />}
        title="Cliente desvinculado"
        description="No puedes modificar rutinas de un cliente que ya no esta vinculado."
        actionLabel="Volver"
        onAction={() => navigation.goBack()}
      />
    );
  }

  function renderContent() {
    if (routinesQuery.isLoading) {
      return (
        <BaseCard style={styles.stateCard}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.stateTitle}>Cargando rutinas</Text>
          <Text style={styles.stateText}>Estamos buscando las rutinas disponibles del entrenador.</Text>
        </BaseCard>
      );
    }

    if (routinesQuery.isError) {
      return (
        <BaseCard style={styles.stateCard}>
          <AlertCircle size={34} color={theme.colors.error} />
          <Text style={styles.stateTitle}>No pudimos cargar las rutinas</Text>
          <Text style={styles.stateText}>Revisa tu conexion e intenta de nuevo.</Text>
          <SecondaryButton label="Reintentar" onPress={() => routinesQuery.refetch()} />
        </BaseCard>
      );
    }

    if (filteredOptions.length === 0) {
      return (
        <BaseCard style={styles.stateCard}>
          <Dumbbell size={34} color={theme.colors.textMuted} />
          <Text style={styles.stateTitle}>No hay rutinas para asignar</Text>
          <Text style={styles.stateText}>
            Crea una rutina en la pestana Rutinas o cambia la busqueda actual.
          </Text>
        </BaseCard>
      );
    }

    return (
      <View style={styles.routineList}>
        {filteredOptions.map((option) => {
          const selected = selectedRoutineId === option.routine.id;
          return (
            <TouchableOpacity
              key={option.routine.id}
              activeOpacity={0.82}
              style={[styles.routineCard, selected ? styles.routineCardSelected : null]}
              onPress={() => selectRoutine(option)}
              accessibilityRole="button"
              accessibilityLabel={`Seleccionar ${option.routine.name}`}
            >
              <View style={styles.routineIcon}>
                <Dumbbell
                  size={20}
                  color={selected ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
              <View style={styles.routineCopy}>
                <Text style={styles.routineTitle}>{option.routine.name}</Text>
                <Text style={styles.routineMeta}>
                  {option.dayLabels.length || 0} dias - {option.exerciseCount} ejercicios
                </Text>
                <View style={styles.tagRow}>
                  {(option.dayLabels.length > 0 ? option.dayLabels : ['Sin dias']).map((day) => (
                    <TrainingV2Tag key={`${option.routine.id}-${day}`} label={day} />
                  ))}
                </View>
              </View>
              {selected ? (
                <CheckCircle2 size={22} color={theme.colors.primary} />
              ) : (
                <ChevronRight size={18} color={theme.colors.textMuted} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <>
      <TrainingV2Screen
        title={screenTitle}
        subtitle={`Cliente: ${client.clientName}`}
        titleColor={theme.colors.textPrimary}
        onBack={requestClose}
        footer={
          <View style={styles.footerActions}>
            {successMessage ? (
              <PrimaryButton label="Volver al cliente" onPress={leaveScreen} />
            ) : (
              <>
                {validationError ? <Text style={styles.validationText}>{validationError}</Text> : null}
                {mutationError ? <Text style={styles.validationText}>{mutationError}</Text> : null}
                <PrimaryButton
                  label={isSubmitting ? 'Guardando' : currentAssignment ? 'Guardar reemplazo' : 'Asignar rutina'}
                  onPress={submitAssignment}
                  loading={isSubmitting}
                  disabled={!canSubmit}
                />
                <SecondaryButton label="Cancelar" onPress={requestClose} disabled={isSubmitting} />
              </>
            )}
          </View>
        }
      >
      <BaseCard style={styles.clientCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{client.initials}</Text>
        </View>
        <View style={styles.clientCopy}>
          <Text style={styles.clientName}>{client.clientName}</Text>
          <Text style={styles.clientMeta}>{client.goal} - {client.experience}</Text>
        </View>
      </BaseCard>

      <BaseCard style={styles.currentCard}>
        <View style={styles.currentHeader}>
          <Dumbbell size={20} color={theme.colors.primary} />
          <View style={styles.currentCopy}>
            <Text style={styles.currentTitle}>
              {currentAssignment ? 'Rutina actual' : 'Seleccion inicial'}
            </Text>
            <Text style={styles.currentText}>
              {currentAssignment
                ? currentAssignment.routineName
                : selectedOption
                  ? selectedOption.routine.name
                  : 'Elige una rutina para asignar.'}
            </Text>
          </View>
        </View>
        {hasUnsavedChanges ? (
          <Text style={styles.unsavedText}>Tienes cambios sin guardar en esta asignacion.</Text>
        ) : null}
      </BaseCard>

      {successMessage ? (
        <BaseCard style={styles.successCard}>
          <CheckCircle2 size={22} color={theme.colors.success} />
          <View style={styles.successCopy}>
            <Text style={styles.successTitle}>Cambios guardados</Text>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        </BaseCard>
      ) : null}

      <View style={styles.searchBox}>
        <Search size={20} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar rutina"
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          style={styles.searchInput}
        />
      </View>

      <TrainingV2SectionHeader title="Rutinas disponibles" />
      {renderContent()}

      <TrainingV2SectionHeader title="Nota para seguimiento" />
      <View style={styles.noteBox}>
        <TextInput
          value={note}
          onChangeText={(value) => {
            clearFeedback();
            setNote(value);
          }}
          placeholder="Ej. Enfatizar tecnica en sentadilla esta semana"
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          multiline
          maxLength={180}
          style={styles.noteInput}
        />
        <Text style={styles.noteCounter}>{note.length}/180</Text>
      </View>
      </TrainingV2Screen>

      <Modal visible={confirmVisible} animationType="slide" transparent>
        <View style={styles.sheetOverlay}>
          <View style={styles.confirmSheet}>
            <DragIndicator position="inside" />
            <View style={styles.confirmHeader}>
              <Text style={styles.confirmTitle}>Confirmar reemplazo</Text>
              <Pressable
                onPress={() => setConfirmVisible(false)}
                disabled={isSubmitting}
                style={styles.closeButton}
              >
                <X size={22} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.confirmText}>
              Vas a reemplazar {currentAssignment?.routineName ?? 'la rutina actual'} por{' '}
              {selectedOption?.routine.name ?? 'la nueva rutina'} para {client.clientName}.
            </Text>
            <Text style={styles.confirmHint}>
              La rutina actual sera reemplazada por la nueva seleccion. El cliente recibira una
              notificacion del cambio.
            </Text>
            <PrimaryButton
              label={isSubmitting ? 'Guardando' : 'Confirmar reemplazo'}
              onPress={persistAssignment}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
            <SecondaryButton
              label="Seguir editando"
              onPress={() => setConfirmVisible(false)}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={discardVisible} animationType="slide" transparent>
        <View style={styles.sheetOverlay}>
          <View style={styles.confirmSheet}>
            <DragIndicator position="inside" />
            <View style={styles.confirmHeader}>
              <Text style={styles.confirmTitle}>Descartar cambios</Text>
              <Pressable
                onPress={() => setDiscardVisible(false)}
                disabled={isSubmitting}
                style={styles.closeButton}
              >
                <X size={22} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.confirmText}>
              Hay cambios sin guardar en la rutina asignada de {client.clientName}.
            </Text>
            <Text style={styles.confirmHint}>
              Si sales ahora, la rutina vigente se mantiene sin modificaciones.
            </Text>
            <PrimaryButton
              label="Seguir editando"
              onPress={() => setDiscardVisible(false)}
              disabled={isSubmitting}
            />
            <SecondaryButton label="Salir sin guardar" onPress={leaveScreen} disabled={isSubmitting} />
          </View>
        </View>
      </Modal>
    </>
  );
}

function CenteredState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <TrainingV2Screen title="Asignar rutina" titleColor={theme.colors.textPrimary}>
      <BaseCard style={styles.centerCard}>
        <View style={styles.centerIcon}>{icon}</View>
        <Text style={styles.centerTitle}>{title}</Text>
        <Text style={styles.centerText}>{description}</Text>
        {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  clientCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  clientName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  clientMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  currentCard: {
    gap: theme.spacing.sm,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceElevated,
  },
  currentHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  currentCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  currentTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  currentText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  unsavedText: {
    color: theme.colors.warning,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  successCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    borderColor: 'rgba(34, 197, 94, 0.34)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  successCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  successTitle: {
    color: theme.colors.success,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  successText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  searchBox: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingVertical: theme.spacing.sm,
  },
  routineList: {
    gap: theme.spacing.md,
  },
  routineCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
  routineCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  routineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  routineTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  routineMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  stateCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  stateTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  stateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  noteBox: {
    minHeight: 112,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  noteInput: {
    minHeight: 70,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlignVertical: 'top',
  },
  noteCounter: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'right',
  },
  footerActions: {
    gap: theme.spacing.sm,
  },
  validationText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  confirmSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  confirmHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  centerCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxl,
  },
  centerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
});
