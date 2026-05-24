import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Search,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useRoutines } from '@/features/training/hooks/use-routines';
import {
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { theme } from '@/theme';
import type { TrainerClientsStackParamList } from '@/navigation/types';
import { useTrainerClientAssignmentsStore } from '../stores/trainer-client-assignments.store';
import type { TrainerRoutineOption } from '../types/trainer-clients';
import { buildRoutineOption, buildTrainerClientViewModel } from './trainer-clients.mock';

type Props = NativeStackScreenProps<TrainerClientsStackParamList, 'AssignRoutine'>;

const WEEK_DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

export default function AssignRoutineScreen({ navigation, route }: Props) {
  const params = route.params;
  const client = React.useMemo(() => buildTrainerClientViewModel(params), [params]);
  const routinesQuery = useRoutines();
  const assignRoutine = useTrainerClientAssignmentsStore((state) => state.assignRoutine);
  const currentAssignment = useTrainerClientAssignmentsStore(
    (state) => state.assignmentsByLinkId[params.linkId],
  );
  const [query, setQuery] = React.useState('');
  const [selectedRoutineId, setSelectedRoutineId] = React.useState<string | null>(
    currentAssignment?.routineId ?? null,
  );
  const [selectedDays, setSelectedDays] = React.useState<string[]>(
    currentAssignment?.days ?? ['Lun', 'Mie', 'Vie'],
  );
  const [note, setNote] = React.useState(currentAssignment?.note ?? '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const routineOptions = React.useMemo(
    () => (routinesQuery.data ?? []).map(buildRoutineOption),
    [routinesQuery.data],
  );
  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return routineOptions.filter((option) =>
      option.routine.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query, routineOptions]);
  const selectedOption =
    routineOptions.find((option) => option.routine.id === selectedRoutineId) ?? null;

  const toggleDay = (day: string) => {
    setValidationError(null);
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  };

  const selectRoutine = (option: TrainerRoutineOption) => {
    setSelectedRoutineId(option.routine.id);
    setValidationError(null);
    if (!currentAssignment || currentAssignment.routineId !== option.routine.id) {
      setSelectedDays(option.dayLabels.length > 0 ? option.dayLabels : ['Lun', 'Mie', 'Vie']);
    }
  };

  const submitAssignment = () => {
    if (!selectedOption) {
      setValidationError('Selecciona una rutina para asignar.');
      return;
    }

    if (selectedDays.length === 0) {
      setValidationError('Selecciona al menos un dia de entrenamiento.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      assignRoutine({
        linkId: params.linkId,
        routineId: selectedOption.routine.id,
        routineName: selectedOption.routine.name,
        assignedAt: new Date().toISOString(),
        days: selectedDays,
        note: note.trim() || undefined,
      });
      setIsSubmitting(false);
      navigation.goBack();
    }, 450);
  };

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
    <TrainingV2Screen
      title="Asignar rutina"
      subtitle={`Cliente: ${client.clientName}`}
      titleColor={theme.colors.textPrimary}
      onBack={() => navigation.goBack()}
      footer={
        <View style={styles.footerActions}>
          {validationError ? <Text style={styles.validationText}>{validationError}</Text> : null}
          <PrimaryButton
            label={isSubmitting ? 'Asignando' : currentAssignment ? 'Reemplazar rutina' : 'Asignar rutina'}
            onPress={submitAssignment}
            loading={isSubmitting}
            disabled={isSubmitting || !selectedOption || selectedDays.length === 0}
          />
          <SecondaryButton label="Cancelar" onPress={() => navigation.goBack()} disabled={isSubmitting} />
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

      <TrainingV2SectionHeader title="Calendario" />
      <BaseCard style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <CalendarDays size={18} color={theme.colors.primary} />
          <Text style={styles.calendarText}>Dias sugeridos para esta asignacion</Text>
        </View>
        <View style={styles.dayChips}>
          {WEEK_DAYS.map((day) => (
            <Chip
              key={day}
              label={day}
              selected={selectedDays.includes(day)}
              onPress={() => toggleDay(day)}
              disabled={isSubmitting}
            />
          ))}
        </View>
      </BaseCard>

      <TrainingV2SectionHeader title="Nota para seguimiento" />
      <View style={styles.noteBox}>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ej. Enfatizar tecnica en sentadilla esta semana"
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          multiline
          maxLength={180}
          style={styles.noteInput}
        />
        <Text style={styles.noteCounter}>{note.length}/180</Text>
      </View>

      <BaseCard style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Asignacion local</Text>
        <Text style={styles.noticeText}>
          Esta vista guarda la seleccion en estado local del feature. No llama endpoints ni cambia
          contratos API.
        </Text>
      </BaseCard>
    </TrainingV2Screen>
  );
}
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0B0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#A0A0B0',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2A2A3E',
    borderRadius: 8,
  },
  retryText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#A0A0B0',
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  routineCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#1A1A2E',
  },
  routineCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  routineInfo: {
    gap: 2,
  },
  routineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routineMeta: {
    fontSize: 12,
    color: '#A0A0B0',
  },
  footer: {
    marginTop: 16,
    gap: 12,
  },
  notesLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  assignButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  assignButtonDisabled: {
    opacity: 0.5,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
=======
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
  calendarCard: {
    gap: theme.spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  calendarText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  dayChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
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
  noticeCard: {
    gap: theme.spacing.xs,
  },
  noticeTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  noticeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footerActions: {
    gap: theme.spacing.sm,
  },
  validationText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
>>>>>>> screens-front-dev
});
