import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Check, Clock, Dumbbell, Layers } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { TrainingV2Screen, TrainingV2SectionHeader } from './TrainingV2Primitives';
import { useRoutineTemplateDetail } from '@/features/training/hooks/use-routine-templates';
import { useHomeProfile } from '@/features/home/hooks/use-home-data';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { TrainingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'TemplateDetail'>;

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const dayLabels: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miercoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sabado',
  sunday: 'Domingo',
};

export default function TemplateDetailScreen({ route, navigation }: Props) {
  const { templateId } = route.params;
  const { data: detail, isLoading, isError } = useRoutineTemplateDetail(templateId);
  const { data: profile } = useHomeProfile();
  const [isAcquiring, setIsAcquiring] = useState(false);

  const acquireRoutine = () => {
    const parts = templateId.split('-');
    const experienceLevel = parts[0];
    const rawSplit = parts.slice(1).join('-') || null;
    const splitKey = rawSplit === 'default' ? undefined : (rawSplit as 'ppl' | 'arnold' | undefined);
    const validLevels = ['beginner', 'intermediate', 'advanced'];

    if (!detail || !validLevels.includes(experienceLevel)) return;

    Alert.alert(
      'Adquirir rutina',
      `Se agregara "${detail.name}" a tus rutinas. Las series se generaran segun tu nivel y estrategia de entrenamiento.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adquirir',
          onPress: async () => {
            setIsAcquiring(true);
            try {
              await apiClient.post(API_ENDPOINTS.routines.default, {
                experienceLevel,
                trainingSplitKey: splitKey,
                trainingStrategyKey: profile?.defaultTrainingStrategyKey ?? 'straight',
              });
              Alert.alert('Rutina adquirida', 'La rutina se agrego a tus rutinas disponibles.', [
                {
                  text: 'Ir a mis rutinas',
                  onPress: () => {
                    navigation.navigate('RoutinesList');
                  },
                },
              ]);
            } catch (error: any) {
              const message =
                error?.response?.data?.message ?? 'No se pudo adquirir la rutina. Intenta de nuevo.';
              Alert.alert('Error', message);
            } finally {
              setIsAcquiring(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <TrainingV2Screen title="Cargando..." onBack={() => navigation.goBack()}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </TrainingV2Screen>
    );
  }

  if (isError || !detail) {
    return (
      <TrainingV2Screen title="Error" onBack={() => navigation.goBack()}>
        <BaseCard style={styles.center}>
          <AlertCircle size={34} color={theme.colors.error} />
          <Text style={styles.errorText}>No se pudo cargar el detalle</Text>
          <SecondaryButton label="Volver" onPress={() => navigation.goBack()} />
        </BaseCard>
      </TrainingV2Screen>
    );
  }

  const level = levelLabels[detail.experienceLevel] ?? 'Intermedio';
  const totalSets = detail.days.reduce(
    (sum, d) => sum + d.exercises.reduce((s, e) => s + e.setsCount, 0),
    0,
  );

  return (
    <TrainingV2Screen
      title={`${level} - ${detail.name}`}
      titleColor={theme.colors.textPrimary}
      onBack={() => navigation.goBack()}
    >
      <BaseCard style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Dumbbell size={18} color={theme.colors.primary} />
            <Text style={styles.statValue}>
              {detail.days.reduce((s, d) => s + d.exercises.length, 0)}
            </Text>
            <Text style={styles.statLabel}>ejercicios</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Layers size={18} color={theme.colors.primary} />
            <Text style={styles.statValue}>{detail.days.length}</Text>
            <Text style={styles.statLabel}>dias</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Clock size={18} color={theme.colors.primary} />
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>series</Text>
          </View>
        </View>
      </BaseCard>

      <TrainingV2SectionHeader title="Dias de entrenamiento" />

      {detail.days.map((day) => (
        <BaseCard key={day.dayOfWeek} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>
                {dayLabels[day.dayOfWeek] ?? day.dayOfWeek}
              </Text>
            </View>
            <Text style={styles.dayCount}>{day.exercises.length} ejercicios</Text>
          </View>
          <View style={styles.exerciseList}>
            {day.exercises.map((ex, idx) => (
              <View key={idx} style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <Check size={14} color={theme.colors.success} />
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                </View>
                <Text style={styles.exerciseSets}>
                  {ex.setsCount} x {ex.initialReps}
                </Text>
              </View>
            ))}
          </View>
        </BaseCard>
      ))}

      <PrimaryButton
        label={isAcquiring ? 'Adquiriendo...' : 'Adquirir rutina'}
        onPress={acquireRoutine}
        loading={isAcquiring}
      />

      <SecondaryButton
        label="Volver"
        onPress={() => navigation.goBack()}
      />
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxl,
  },
  errorText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '800',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  dayCard: {
    gap: theme.spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  dayBadgeText: {
    color: theme.colors.background,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '700',
  },
  dayCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
  },
  exerciseList: {
    gap: theme.spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    flex: 1,
  },
  exerciseSets: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
  },
});
