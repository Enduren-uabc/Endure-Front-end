import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Plus, Target } from 'lucide-react-native';
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
import { exercisesV2 } from './training-v2.mock';
import type { TrainingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'ExerciseDetail'>;

export default function ExerciseDetailV2Screen({ navigation, route }: Props) {
  const exercise =
    exercisesV2.find((item) => item.id === route.params.exercise.id) ??
    exercisesV2.find((item) => item.name === route.params.exercise.name) ??
    exercisesV2[0];

  return (
    <TrainingV2Screen
      title="Detalle de ejercicio"
      titleColor={theme.colors.textPrimary}
      subtitle="Consulta tecnica, musculo principal y series sugeridas."
      onBack={navigation.goBack}
      footer={
        <View style={styles.footerActions}>
          <SecondaryButton label="Cancelar" onPress={navigation.goBack} style={styles.footerButton} />
          <PrimaryButton
            label="Agregar"
            onPress={() => navigation.navigate('RoutineBuilder', { id: route.params.routineId })}
            icon={<Plus size={18} color={theme.colors.background} />}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.heroWrap}>
        <ImageBackground source={{ uri: exercise.imageUri }} style={styles.heroImage} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <TrainingV2Tag label={exercise.group} tone="primary" />
            <Text style={styles.heroTitle}>{exercise.name}</Text>
            <Text style={styles.heroMeta}>{exercise.primaryMuscle} - {exercise.equipment}</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview label="Nivel" value={exercise.level} helper="Sugerido" />
        <TrainingV2FieldPreview label="Series" value={`${exercise.sets.length}`} helper="Configurables" />
      </View>

      <TrainingV2SectionHeader title="Instrucciones" />
      <View style={styles.instructions}>
        {exercise.instructions.map((instruction, index) => (
          <BaseCard key={instruction} style={styles.instructionCard}>
            <View style={styles.stepIndex}>
              <Text style={styles.stepIndexText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </BaseCard>
        ))}
      </View>

      <BaseCard style={styles.targetCard}>
        <View style={styles.targetHeader}>
          <Target size={20} color={theme.colors.primary} />
          <Text style={styles.targetTitle}>Series objetivo</Text>
        </View>
        <View style={styles.setList}>
          {exercise.sets.map((set) => (
            <View key={set.id} style={styles.setRow}>
              <View style={styles.setLabelWrap}>
                <CheckCircle2
                  size={18}
                  color={set.completed ? theme.colors.success : theme.colors.textMuted}
                />
                <Text style={styles.setLabel}>{set.label}</Text>
              </View>
              <Text style={styles.setValue}>
                {set.targetReps} reps - {set.targetWeightKg} kg
              </Text>
            </View>
          ))}
        </View>
        <TrainingV2ProgressBar progress={1 / 3} label="Progreso de configuracion" />
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
  },
  heroImage: {
    width: '100%',
    minHeight: 250,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.46)',
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
