import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle, Dumbbell, Plus, Target } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import type { TrainingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'ExerciseDetail'>;

export default function ExerciseDetailV2Screen({ navigation, route }: Props) {
  const exercise = route.params.exercise;
  const totalSets = typeof exercise.sets === 'number' ? exercise.sets : exercise.sets.length;

  return (
    <TrainingV2Screen
      title="Detalle de ejercicio"
      titleColor={theme.colors.textPrimary}
      subtitle={exercise.name}
      onBack={navigation.goBack}
      footer={
        <View style={styles.footerActions}>
          <SecondaryButton label="Cancelar" onPress={navigation.goBack} style={styles.footerButton} />
          <PrimaryButton
            label="Agregar a rutina"
            onPress={() => navigation.navigate('RoutineBuilder', { id: route.params.routineId })}
            icon={<Plus size={18} color={theme.colors.background} />}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.heroWrap}>
        <View style={styles.heroPlaceholder}>
          <Dumbbell size={40} color={theme.colors.border} />
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{exercise.name}</Text>
          <Text style={styles.heroMeta}>{totalSets} series configuradas</Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview label="Series" value={`${totalSets}`} helper="Configurables" />
        <TrainingV2FieldPreview label="Reps por serie" value={`${exercise.repsPerSet ?? '--'}`} helper="Objetivo" />
      </View>

      <TrainingV2SectionHeader title="Series objetivo" />
      <BaseCard style={styles.targetCard}>
        <View style={styles.targetHeader}>
          <Target size={20} color={theme.colors.primary} />
          <Text style={styles.targetTitle}>Configuracion actual</Text>
        </View>
        <View style={styles.setList}>
          {Array.from({ length: totalSets }, (_, i) => (
            <View key={i} style={styles.setRow}>
              <View style={styles.setLabelWrap}>
                <CheckCircle size={18} color={theme.colors.textMuted} />
                <Text style={styles.setLabel}>Serie {i + 1}</Text>
              </View>
              <Text style={styles.setValue}>
                {exercise.repsPerSet ?? '?'} reps - {exercise.weight ?? '?'} kg
              </Text>
            </View>
          ))}
        </View>
        <TrainingV2ProgressBar progress={0} label="Completa la configuracion desde el constructor" />
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.primaryMuted,
  },
  heroPlaceholder: {
    width: '100%',
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
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
  heroMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  instructions: {
    gap: theme.spacing.sm,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  stepIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  instructionText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  targetCard: {
    gap: theme.spacing.md,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  targetTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  setList: {
    gap: theme.spacing.sm,
  },
  setRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  setLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  setLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  setValue: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
