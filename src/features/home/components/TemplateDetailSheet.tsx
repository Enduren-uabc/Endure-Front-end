import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { X, Dumbbell, Clock, Layers, Check } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import type { RoutineTemplate, RoutineTemplateDetail } from '@/features/training/screens/v2/training-v2.types';
import { useRoutineTemplateDetail } from '@/features/training/hooks/use-routine-templates';

interface TemplateDetailSheetProps {
  template: RoutineTemplate | null;
  onClose: () => void;
  onFork: (template: RoutineTemplate) => void;
  isForking?: boolean;
}

const levelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const dayLabels: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export default function TemplateDetailSheet({
  template,
  onClose,
  onFork,
  isForking = false,
}: TemplateDetailSheetProps) {
  const { data: detail, isLoading, isError } = useRoutineTemplateDetail(template?.id ?? '');

  if (!template) return null;

  const level = levelLabels[template.experienceLevel] ?? 'Intermedio';
  const splitLabel = template.splitKey === 'ppl' ? 'Split PPL' : null;

  return (
    <Modal
      visible={!!template}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{level}</Text>
              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{level}</Text>
                </View>
                {splitLabel ? (
                  <View style={[styles.badge, styles.badgePpl]}>
                    <Text style={styles.badgeTextPpl}>{splitLabel}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {isLoading ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <SkeletonStats />
              <Text style={styles.sectionTitle}>Dias de entrenamiento</Text>
              {Array.from({ length: template.dayCount }).map((_, i) => (
                <SkeletonDay key={i} exerciseCount={i === 0 ? template.exerciseCount : Math.max(1, Math.round(template.exerciseCount / template.dayCount))} />
              ))}
            </ScrollView>
          ) : isError ? (
            <BaseCard style={styles.errorCard}>
              <Text style={styles.errorTitle}>No se pudo cargar el detalle</Text>
              <SecondaryButton label="Cerrar" onPress={onClose} />
            </BaseCard>
          ) : detail ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <BaseCard style={styles.statsCard}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Dumbbell size={18} color={theme.colors.primary} />
                    <Text style={styles.statValue}>{template.exerciseCount}</Text>
                    <Text style={styles.statLabel}>ejercicios</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Layers size={18} color={theme.colors.primary} />
                    <Text style={styles.statValue}>{template.dayCount}</Text>
                    <Text style={styles.statLabel}>dias</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Clock size={18} color={theme.colors.primary} />
                    <Text style={styles.statValue}>{template.totalSets}</Text>
                    <Text style={styles.statLabel}>series</Text>
                  </View>
                </View>
              </BaseCard>

              <Text style={styles.sectionTitle}>Dias de entrenamiento</Text>

              {detail.days.map((day) => (
                <BaseCard key={day.dayOfWeek} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>
                        {dayLabels[day.dayOfWeek] ?? day.dayOfWeek}
                      </Text>
                    </View>
                    <Text style={styles.dayExerciseCount}>
                      {day.exercises.length} ejercicios
                    </Text>
                  </View>
                  <View style={styles.exerciseList}>
                    {day.exercises.map((exercise, idx) => (
                      <View key={idx} style={styles.exerciseRow}>
                        <View style={styles.exerciseInfo}>
                          <Check size={14} color={theme.colors.success} />
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                        </View>
                        <Text style={styles.exerciseSets}>
                          {exercise.setsCount} x {exercise.initialReps}
                        </Text>
                      </View>
                    ))}
                  </View>
                </BaseCard>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.actions}>
            <SecondaryButton label="Cerrar" onPress={onClose} />
            <PrimaryButton
              label={isForking ? 'Creando...' : 'Hacer fork'}
              onPress={() => onFork(template)}
              disabled={isForking}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SkeletonBlock({
  width,
  height = 16,
  borderRadius = 6,
}: {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}) {
  return (
    <View
      style={{
        width: (width ?? '100%') as any,
        height,
        borderRadius,
        backgroundColor: theme.colors.surfaceElevated,
      }}
    />
  );
}

function SkeletonStats() {
  return (
    <BaseCard style={styles.statsCard}>
      <View style={styles.statsRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.statItem}>
            <SkeletonBlock width={24} height={24} borderRadius={12} />
            <SkeletonBlock width={40} height={26} borderRadius={6} />
            <SkeletonBlock width={50} height={12} borderRadius={4} />
          </View>
        ))}
      </View>
    </BaseCard>
  );
}

function SkeletonDay({ exerciseCount }: { exerciseCount: number }) {
  const count = Math.min(exerciseCount, 5);
  return (
    <BaseCard style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <SkeletonBlock width={60} height={22} borderRadius={6} />
        <SkeletonBlock width={80} height={14} borderRadius={4} />
      </View>
      <View style={styles.exerciseList}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={styles.exerciseRow}>
            <View style={styles.exerciseInfo}>
              <SkeletonBlock width={14} height={14} borderRadius={7} />
              <SkeletonBlock width={`${55 + i * 8}%`} height={16} borderRadius={4} />
            </View>
            <SkeletonBlock width={60} height={14} borderRadius={4} />
          </View>
        ))}
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  badges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },
  badgePpl: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  badgeTextPpl: {
    color: '#22C55E',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  errorTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
  content: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
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
    fontWeight: theme.typography.heading3.fontWeight,
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
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
    marginTop: theme.spacing.sm,
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
  dayExerciseCount: {
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
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});