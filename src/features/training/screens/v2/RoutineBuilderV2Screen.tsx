import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GripVertical, Plus, Save } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';
import {
  TrainingV2ChipRow,
  TrainingV2FieldPreview,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2SheetPreview,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { currentRoutineV2 } from './training-v2.mock';
import type { TrainingStackParamList } from '@/navigation/types';

const noop = () => undefined;
type Props = NativeStackScreenProps<TrainingStackParamList, 'RoutineBuilder'>;
const typeOptions = ['Fuerza', 'Cardio', 'Movilidad'];
const dayOptions = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function RoutineBuilderV2Screen({ navigation, route }: Props) {
  const isNewRoutine = route.params.id === 'new';
  const [routineName, setRoutineName] = React.useState(isNewRoutine ? '' : currentRoutineV2.name);
  const [routineType, setRoutineType] = React.useState('Fuerza');
  const [selectedDays, setSelectedDays] = React.useState<string[]>(['L', 'X', 'V']);
  const [saveState, setSaveState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const missingName = routineName.trim().length === 0;
  const missingDays = selectedDays.length === 0;
  const isSaving = saveState === 'loading';
  const canSave = !missingName && !missingDays && !isSaving;

  function toggleDay(day: string) {
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
  }

  function handleSave() {
    if (!canSave) return;
    setSaveState('success');
    navigation.navigate('RoutineDetail', { id: currentRoutineV2.id });
  }

  return (
    <TrainingV2Screen
      title="Nueva rutina"
      titleColor={theme.colors.textPrimary}
      subtitle="Organiza ejercicios, dias y objetivos sin tocar datos reales."
      onBack={navigation.goBack}
      footer={
        <PrimaryButton
          label={isSaving ? 'Guardando' : 'Guardar rutina'}
          onPress={handleSave}
          disabled={!canSave}
          loading={isSaving}
          icon={<Save size={18} color={theme.colors.background} />}
        />
      }
    >
      <BaseCard style={styles.formCard}>
        <TextInput
          label="Nombre"
          value={routineName}
          onChangeText={setRoutineName}
          placeholder="Ej. Fuerza full body"
          error={missingName ? 'Ingresa un nombre para la rutina.' : undefined}
          maxLength={50}
          allowEmoji={false}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tipo de rutina</Text>
          <TrainingV2ChipRow options={typeOptions} selected={routineType} onSelect={setRoutineType} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Dias de entrenamiento</Text>
          <View style={styles.dayRow}>
            {dayOptions.map((day) => {
              const selected = selectedDays.includes(day);
              return (
                <Text
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[styles.dayChip, selected ? styles.dayChipSelected : null]}
                >
                  {day}
                </Text>
              );
            })}
          </View>
          {missingDays ? <Text style={styles.errorText}>Selecciona al menos un dia.</Text> : null}
        </View>

        <View style={styles.previewGrid}>
          <TrainingV2FieldPreview label="Duracion estimada" value="45 min" helper="Calculada por ejercicios" />
          <TrainingV2FieldPreview label="Objetivo" value="Ganar fuerza" helper="Editable despues" />
        </View>
      </BaseCard>

      <TrainingV2SectionHeader
        title="Ejercicios"
        actionLabel="Agregar"
        onAction={() => navigation.navigate('ExerciseCatalog', { routineId: currentRoutineV2.id })}
      />

      <View style={styles.exerciseList}>
        {currentRoutineV2.exercises.map((exercise, index) => (
          <BaseCard key={exercise.id} style={styles.exerciseCard}>
            <GripVertical size={18} color={theme.colors.textMuted} />
            <View style={styles.exerciseBody}>
              <Text style={styles.exerciseTitle}>{exercise.name}</Text>
              <Text style={styles.exerciseMeta}>
                {exercise.sets.length} series - {exercise.sets[0]?.targetReps ?? 0} reps - {exercise.sets[0]?.targetWeightKg ?? 0} kg
              </Text>
              <View style={styles.tagRow}>
                <TrainingV2Tag label={exercise.group} />
                <TrainingV2Tag label={exercise.equipment} />
              </View>
            </View>
            <Text style={styles.exerciseOrder}>{index + 1}</Text>
          </BaseCard>
        ))}
      </View>

      <TrainingV2SheetPreview
        title="Sheet: agregar ejercicio"
        description="Buscador, filtros por grupo muscular y accion para insertar el ejercicio en la rutina."
      >
        <SecondaryButton
          label="Abrir selector visual"
          onPress={() => navigation.navigate('ExerciseCatalog', { routineId: currentRoutineV2.id })}
        />
      </TrainingV2SheetPreview>

      {saveState === 'success' ? (
        <BaseCard style={styles.successCard}>
          <Text style={styles.successText}>Rutina lista para guardar cuando se conecte al flujo real.</Text>
        </BaseCard>
      ) : null}

      {saveState === 'error' ? (
        <BaseCard style={styles.errorCard}>
          <Text style={styles.errorText}>No pudimos guardar la rutina. Intenta nuevamente.</Text>
        </BaseCard>
      ) : null}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: theme.spacing.lg,
  },
  fieldGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  dayRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 38,
    fontWeight: '700',
  },
  dayChipSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
    color: theme.colors.primary,
  },
  previewGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  exerciseList: {
    gap: theme.spacing.sm,
  },
  exerciseCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  exerciseBody: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  exerciseTitle: {
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  exerciseOrder: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '800',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  successCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.34)',
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.34)',
  },
});
