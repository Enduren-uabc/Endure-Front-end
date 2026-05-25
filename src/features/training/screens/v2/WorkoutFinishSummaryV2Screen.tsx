import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Award, CheckCircle2, Flame, RefreshCcw } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { useWorkoutSessionDetail } from '@/features/training/hooks/use-workout-session';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutFinishSummary'>;

export default function WorkoutFinishSummaryV2Screen({ navigation, route }: Props) {
  const { data: session, isLoading, isError, refetch } = useWorkoutSessionDetail(route.params.sessionId);

  if (isLoading) {
    return (
      <TrainingV2Screen title="Resumen" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando resumen de la sesion...</Text>
        </View>
      </TrainingV2Screen>
    );
  }

  if (isError || !session) {
    return (
      <TrainingV2Screen title="Resumen" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
        <View style={styles.center}>
          <AlertCircle size={44} color={theme.colors.error} />
          <Text style={styles.centerTitle}>No pudimos cargar el resumen</Text>
          <Text style={styles.centerText}>Revisa tu conexion e intenta nuevamente.</Text>
          <SecondaryButton label="Reintentar" onPress={() => refetch()} />
        </View>
      </TrainingV2Screen>
    );
  }

  const totalSets = session.exercises?.reduce((sum, ex) => sum + (ex.workoutSets?.length ?? ex.targetSets?.length ?? 0), 0) ?? 0;
  const completedSets = session.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.filter((s) => s.completed).length ?? 0), 0
  ) ?? 0;

  return (
    <TrainingV2Screen
      title="Resumen"
      titleColor={theme.colors.textPrimary}
      subtitle="Buen trabajo. Aqui esta el cierre de tu sesion."
      onBack={navigation.goBack}
      footer={
        <View style={styles.footerActions}>
          <SecondaryButton
            label="Ver historial"
            onPress={() => navigation.navigate('WorkoutHistory')}
            style={styles.footerButton}
          />
          <PrimaryButton
            label="Compartir en redes"
            onPress={() => navigation.navigate('CreateWorkoutPost', { sessionId: route.params.sessionId })}
            style={styles.footerButton}
          />
          <SecondaryButton
            label="Listo"
            onPress={() => navigation.navigate('WorkoutStart')}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <BaseCard style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <CheckCircle2 size={34} color={theme.colors.success} />
        </View>
        <Text style={styles.heroTitle}>Entrenamiento completado</Text>
        <Text style={styles.heroText}>{session.routineName ?? 'Rutina'} quedo registrada con progreso completo.</Text>
        <View style={styles.tagRow}>
          <TrainingV2Tag label={`${session.durationMinutes ?? 0} min`} tone="primary" />
          <TrainingV2Tag label={`${completedSets}/${totalSets} series`} />
        </View>
      </BaseCard>

      <TrainingV2SectionHeader title="Detalle rapido" />
      <View style={styles.detailGrid}>
        <TrainingV2FieldPreview label="Duracion" value={`${session.durationMinutes ?? 0} min`} helper="Tiempo activo" />
        <TrainingV2FieldPreview label="Series completadas" value={`${completedSets}/${totalSets}`} helper="De la sesion" />
      </View>

      <BaseCard style={styles.achievementCard}>
        <Award size={20} color={theme.colors.primary} />
        <Text style={styles.achievementText}>
          {session.status === 'finished'
            ? 'Sesion finalizada correctamente. Sigue asi.'
            : 'La sesion quedo registrada en tu historial.'}
        </Text>
        <Flame size={20} color="#F97316" />
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  heroText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  prCard: {
    gap: theme.spacing.md,
    borderColor: 'rgba(249, 115, 22, 0.42)',
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  prIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prBody: {
    flex: 1,
    gap: 2,
  },
  prTitle: {
    color: '#F97316',
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  prText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  achievementText: {
    flex: 1,
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
});
