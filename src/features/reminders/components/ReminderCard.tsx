import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, BellOff, ChevronRight, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { TrainingReminder } from '@/features/reminders/types/reminder';
import { theme } from '@/theme';

interface ReminderCardProps {
  reminder: TrainingReminder;
  onPress: () => void;
  onDelete: () => void;
}

export default function ReminderCard({ reminder, onPress, onDelete }: ReminderCardProps) {
  const isActive = reminder.status === 'activo';
  const dayLabel = DAY_OF_WEEK_LABELS[reminder.dayOfWeek] ?? reminder.dayOfWeek;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <BaseCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            {isActive ? (
              <Bell size={20} color={theme.colors.primary} />
            ) : (
              <BellOff size={20} color={theme.colors.textMuted} />
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.dayTime}>
              {dayLabel} · {reminder.time}
            </Text>
            <Text style={styles.routineName}>{reminder.routineName}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Trash2 size={18} color={theme.colors.error} />
            </TouchableOpacity>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </View>
        </View>
      </BaseCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  dayTime: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
  },
  routineName: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  deleteButton: {
    padding: 4,
  },
});
