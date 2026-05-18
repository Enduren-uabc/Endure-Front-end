import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';
import { useCreateRoutine } from '@/shared/api/services/trainingService';
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_ORDER,
  type DayOfWeek,
} from '@/shared/api/types/training';

const createRoutineSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  dayOfWeeks: z.array(z.enum(DAY_OF_WEEK_ORDER)).min(1, 'Selecciona al menos un dia.'),
});

type CreateRoutineFormData = z.infer<typeof createRoutineSchema>;

export default function CreateRoutineScreen() {
  const router = useRouter();
  const createRoutine = useCreateRoutine();
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRoutineFormData>({
    resolver: zodResolver(createRoutineSchema),
    defaultValues: {
      name: '',
      dayOfWeeks: [],
    },
  });

  const selectedDays = watch('dayOfWeeks');

  React.useEffect(() => {
    if (createRoutine.isError) {
      setError('root', { message: createRoutine.error.message });
    }
  }, [createRoutine.error, createRoutine.isError, setError]);

  const toggleDay = (day: DayOfWeek) => {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day];

    setValue('dayOfWeeks', nextDays, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = (data: CreateRoutineFormData) => {
    createRoutine.mutate(data, {
      onSuccess: () => {
        router.replace('/training');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Crear rutina</Text>
              <Text style={styles.subtitle}>Define el nombre y los dias de entrenamiento.</Text>
            </View>
          </View>

          <BaseCard>
            <View style={styles.form}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Nombre"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ej. Fuerza full body"
                    autoCapitalize="sentences"
                    error={errors.name?.message}
                  />
                )}
              />

              <View style={styles.daysBlock}>
                <Text style={styles.label}>Dias</Text>
                <View style={styles.daysGrid}>
                  {DAY_OF_WEEK_ORDER.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                        onPress={() => toggleDay(day)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                          {DAY_OF_WEEK_LABELS[day]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.dayOfWeeks?.message ? (
                  <Text style={styles.errorText}>{errors.dayOfWeeks.message}</Text>
                ) : null}
              </View>

              {errors.root?.message ? <Text style={styles.errorText}>{errors.root.message}</Text> : null}

              <PrimaryButton
                label="Guardar rutina"
                onPress={handleSubmit(onSubmit)}
                loading={createRoutine.isPending}
                disabled={createRoutine.isPending}
              />
            </View>
          </BaseCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  form: {
    gap: theme.spacing.lg,
  },
  daysBlock: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayChip: {
    minWidth: 70,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  dayChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}24`,
  },
  dayText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});
