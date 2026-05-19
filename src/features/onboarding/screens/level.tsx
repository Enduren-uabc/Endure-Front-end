import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { OnboardingStackParamList } from '@/navigation/types';
import {
  onboardingLevelSchema,
  type OnboardingLevelFormData,
} from '@/features/onboarding/validations/onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';

const LEVELS = [
  {
    value: 'beginner' as const,
    label: 'Principiante',
    description: 'Estoy empezando o llevo poco tiempo entrenando.',
  },
  {
    value: 'intermediate' as const,
    label: 'Intermedio',
    description: 'Entreno con cierta constancia desde hace varios meses.',
  },
  {
    value: 'advanced' as const,
    label: 'Avanzado',
    description: 'Tengo experiencia y busco rutinas mas exigentes.',
  },
];

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Level'>;

export default function OnboardingLevelScreen({ navigation }: Props) {
  const draft = useOnboardingStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingLevelFormData>({
    resolver: zodResolver(onboardingLevelSchema),
    defaultValues: {
      experienceLevel: draft.experienceLevel ?? undefined,
    },
  });

  const onSubmit = (data: OnboardingLevelFormData) => {
    draft.setExperienceLevel(data.experienceLevel);
    navigation.navigate('Summary');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Paso 3 de 4</Text>
          <Text style={styles.title}>Nivel de experiencia</Text>
          <Text style={styles.subtitle}>
            Esto ajusta la intensidad sugerida de tus rutinas.
          </Text>
        </View>

        <Controller
          control={control}
          name="experienceLevel"
          render={({ field: { onChange, value } }) => (
            <View style={styles.options}>
              {LEVELS.map((level) => (
                <View key={level.value} style={styles.optionCard}>
                  <Chip
                    label={level.label}
                    selected={value === level.value}
                    onPress={() => onChange(level.value)}
                  />
                  <Text style={styles.description}>{level.description}</Text>
                </View>
              ))}
              {errors.experienceLevel ? (
                <Text style={styles.errorText}>{errors.experienceLevel.message}</Text>
              ) : null}
            </View>
          )}
        />

        <View style={styles.footer}>
          <PrimaryButton label="Continuar" onPress={handleSubmit(onSubmit)} />
          <SecondaryButton label="Volver" onPress={() => navigation.navigate('BasicData')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
  },
  step: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  options: {
    gap: theme.spacing.md,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  footer: {
    gap: theme.spacing.md,
    marginTop: 'auto',
  },
});
