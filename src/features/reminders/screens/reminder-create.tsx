import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_ORDER } from '@/features/training/types/routine';
import { useReminders, useCreateReminder } from '@/features/reminders/hooks/use-reminders';
import type { RemindersStackParamList } from '@/navigation/types';
import type { DayOfWeek } from '@/features/training/types/routine';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<RemindersStackParamList, 'ReminderCreate'>;

export default function ReminderCreateScreen({ navigation }: Props) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const createReminder = useCreateReminder();
  const { data: existingReminders } = useReminders();

  const handleSave = async () => {
    if (!selectedDay) return;
    if (!hour || !minute) return;

    const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    if (!existingReminders || existingReminders.length === 0) return;

    const activeRoutine = existingReminders[0];
    if (!activeRoutine?.routineId) return;

    createReminder.mutate(
      {
        routineId: activeRoutine.routineId,
        dayOfWeek: selectedDay,
        time,
      },
      {
        onSuccess: () => navigation.goBack(),
      },
    );
  };

  const isValid = selectedDay && hour && minute;
  const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo recordatorio</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BaseCard style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona el día</Text>
          <View style={styles.daysGrid}>
            {DAY_OF_WEEK_ORDER.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                    {DAY_OF_WEEK_LABELS[day]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BaseCard>

        <BaseCard style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona la hora</Text>
          <View style={styles.timeRow}>
            <Clock size={20} color={theme.colors.textMuted} />
            <TextInput
              style={styles.timeInput}
              value={hour}
              onChangeText={setHour}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="HH"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.timeSeparator}>:</Text>
            <TextInput
              style={styles.timeInput}
              value={minute}
              onChangeText={setMinute}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="MM"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.timePreview}>{time}</Text>
          </View>
        </BaseCard>
      </ScrollView>

      <View style={styles.footer}>
        {createReminder.isError && (
          <Text style={styles.errorText}>{(createReminder.error as Error).message}</Text>
        )}
        <PrimaryButton
          label={createReminder.isPending ? 'Guardando...' : 'Guardar recordatorio'}
          onPress={handleSave}
          disabled={!isValid || createReminder.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  dayButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}18`,
  },
  dayButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: theme.colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timeInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    minWidth: 50,
    textAlign: 'center',
  },
  timeSeparator: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: '700',
  },
  timePreview: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    marginLeft: theme.spacing.sm,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
});
