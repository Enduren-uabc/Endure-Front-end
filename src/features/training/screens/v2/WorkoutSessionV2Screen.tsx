import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, Pause, Save, TimerReset, X } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SheetPreview,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { workoutSessionV2 } from './training-v2.mock';
import type { WorkoutStackParamList } from '@/navigation/types';

const noop = () => undefined;
type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutSession'>;

export default function WorkoutSessionV2Screen({ navigation, route }: Props) {
  const [reps, setReps] = React.useState(String(workoutSessionV2.currentSet.targetReps));
  const [weight, setWeight] = React.useState(String(workoutSessionV2.currentSet.targetWeightKg));
  const [setCompleted, setSetCompleted] = React.useState(false);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  const exercise = workoutSessionV2.currentExercise;
  const set = workoutSessionV2.currentSet;
  const isValid = Number(reps) > 0 && Number(weight) >= 0;
  const finishSession = () =>
    navigation.replace('WorkoutFinishSummary', { sessionId: route.params.sessionId });
  const completeOrFinishSet = () => {
    if (setCompleted) {
      finishSession();
      return;
    }

    setSetCompleted(true);
  };

  return (
    <TrainingV2Screen
      title={workoutSessionV2.routine.name}
      titleColor={theme.colors.textPrimary}
      subtitle={`Tiempo activo ${workoutSessionV2.elapsedLabel}`}
      backgroundColor="#000000"
      footer={
        <View style={styles.footerActions}>
          <SecondaryButton
            label="Guardar"
            onPress={() => navigation.navigate('WorkoutStart')}
            style={styles.footerButton}
          />
          <PrimaryButton
            label={setCompleted ? 'Finalizar sesion' : 'Completar serie'}
            onPress={completeOrFinishSet}
            disabled={!isValid}
            icon={<Check size={18} color={theme.colors.background} />}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.topActions}>
        <View style={styles.sessionPill}>
          <Pause size={16} color={theme.colors.primary} />
          <Text style={styles.sessionPillText}>Modo entrenamiento</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() => setShowExitConfirm(true)}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Cerrar entrenamiento"
        >
          <X size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <BaseCard style={styles.exerciseCard}>
        <Text style={styles.exerciseCounter}>Serie 2 de 3</Text>
        <Text style={styles.exerciseTitle}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>{exercise.primaryMuscle} - {exercise.equipment}</Text>
        <View style={styles.tagRow}>
          <TrainingV2Tag label={`${set.targetReps} reps objetivo`} tone="primary" />
          <TrainingV2Tag label={`${set.targetWeightKg} kg objetivo`} />
        </View>
      </BaseCard>

      <View style={styles.inputGrid}>
        <TextInput
          label="Reps reales"
          value={reps}
          onChangeText={setReps}
          placeholder="8"
          keyboardType="numeric"
          inputMode="numeric"
          error={Number(reps) <= 0 ? 'Ingresa reps validas.' : undefined}
        />
        <TextInput
          label="Peso usado"
          value={weight}
          onChangeText={setWeight}
          placeholder="62.5"
          keyboardType="numeric"
          inputMode="decimal"
          error={Number(weight) < 0 ? 'El peso no puede ser negativo.' : undefined}
        />
      </View>

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview label="Siguiente" value="Press de banca" helper="3 series" />
        <TrainingV2FieldPreview label="Descanso" value="90s" helper="Automatico" />
      </View>

      <BaseCard style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <TimerReset size={20} color={theme.colors.primary} />
          <Text style={styles.progressTitle}>Avance de rutina</Text>
        </View>
        <TrainingV2ProgressBar progress={0.42} label="5 de 12 series completadas" />
      </BaseCard>

      {setCompleted ? (
        <TrainingV2SheetPreview
          title="Descanso entre series"
          description="Respira, prepara el siguiente peso y vuelve cuando el contador termine."
        >
          <View style={styles.restTimer}>
            <Text style={styles.restTimerText}>01:30</Text>
            <SecondaryButton label="Saltar descanso" onPress={noop} />
          </View>
        </TrainingV2SheetPreview>
      ) : null}

      {showExitConfirm ? (
        <TrainingV2SheetPreview
          title="Abandonar entrenamiento"
          description="Si sales ahora, la sesion queda incompleta hasta que decidas guardarla."
        >
          <View style={styles.exitActions}>
            <SecondaryButton
              label="Seguir entrenando"
              onPress={() => setShowExitConfirm(false)}
              style={styles.footerButton}
            />
            <PrimaryButton
              label="Guardar salida"
              onPress={() => navigation.navigate('WorkoutStart')}
              icon={<Save size={18} color={theme.colors.background} />}
              style={styles.footerButton}
            />
          </View>
        </TrainingV2SheetPreview>
      ) : null}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionPill: {
    minHeight: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sessionPillText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCard: {
    backgroundColor: '#050505',
    gap: theme.spacing.sm,
    minHeight: 190,
    justifyContent: 'center',
  },
  exerciseCounter: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '800',
  },
  exerciseTitle: {
    color: theme.colors.textPrimary,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  inputGrid: {
    gap: theme.spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  progressCard: {
    gap: theme.spacing.md,
    backgroundColor: '#050505',
  },
  progressHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  progressTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  restTimer: {
    gap: theme.spacing.md,
  },
  restTimerText: {
    color: theme.colors.textPrimary,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
    textAlign: 'center',
  },
  exitActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
