import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle, Clock, Dumbbell, RotateCcw, Trash2, X } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { WorkoutSession } from '@/features/training/types/workout-session';
import { theme } from '@/theme';

interface PendingSessionModalProps {
  visible: boolean;
  session: WorkoutSession;
  onResume: () => void;
  onDiscardAndStart: () => void;
  onFinishAndStart: () => void;
  onClose: () => void;
  isDiscarding?: boolean;
  isFinishing?: boolean;
}

function formatElapsed(startedAt: string): string {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'Menos de 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function countCompletedSets(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, ex) => total + ex.workoutSets.filter((s) => s.completed).length,
    0,
  );
}

function countTotalSets(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, ex) => total + ex.workoutSets.length,
    0,
  );
}

export default function PendingSessionModal({
  visible,
  session,
  onResume,
  onDiscardAndStart,
  onFinishAndStart,
  onClose,
  isDiscarding = false,
  isFinishing = false,
}: PendingSessionModalProps) {
  const completedSets = countCompletedSets(session);
  const totalSets = countTotalSets(session);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <RotateCcw size={24} color={theme.colors.primary} />
            <Text style={styles.title}>Sesión en curso</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Tienes un entrenamiento sin terminar. ¿Qué deseas hacer?
          </Text>

          <View style={styles.statsRow}>
            <BaseCard style={styles.statCard}>
              <Dumbbell size={18} color={theme.colors.primary} />
              <Text style={styles.statValue}>{session.exercises.length}</Text>
              <Text style={styles.statLabel}>Ejercicios</Text>
            </BaseCard>
            <BaseCard style={styles.statCard}>
              <CheckCircle size={18} color={theme.colors.success} />
              <Text style={styles.statValue}>
                {completedSets}/{totalSets}
              </Text>
              <Text style={styles.statLabel}>Sets hechos</Text>
            </BaseCard>
            <BaseCard style={styles.statCard}>
              <Clock size={18} color={theme.colors.warning} />
              <Text style={styles.statValue}>
                {formatElapsed(session.startedAt)}
              </Text>
              <Text style={styles.statLabel}>Duración</Text>
            </BaseCard>
          </View>

          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>
              {DAY_OF_WEEK_LABELS[session.dayOfWeek]}
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Continuar sesión"
              onPress={onResume}
            />

            <SecondaryButton
              label="Finalizar y empezar nueva"
              onPress={onFinishAndStart}
              disabled={isFinishing || isDiscarding}
            />

            <SecondaryButton
              label="Descartar y empezar nueva"
              onPress={onDiscardAndStart}
              disabled={isDiscarding || isFinishing}
              style={styles.discardButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    backgroundColor: theme.colors.surfaceElevated,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'center',
  },
  dayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '20',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
  },
  dayBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  actions: {
    gap: theme.spacing.md,
  },
  discardButton: {
    borderColor: theme.colors.error + '40',
  },
});
