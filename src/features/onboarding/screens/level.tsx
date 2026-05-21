import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sprout, Flame, Trophy } from 'lucide-react-native';
import type { OnboardingStackParamList } from '@/navigation/types';
import {
  onboardingLevelSchema,
  type OnboardingLevelFormData,
} from '@/features/onboarding/validations/onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';

interface LevelOption {
  value: 'beginner' | 'intermediate' | 'advanced';
  label: string;
  description: string;
  Icon: typeof Sprout;
}

const LEVELS: LevelOption[] = [
  {
    value: 'beginner',
    label: 'Principiante',
    description: 'Llevo menos de 6 meses entrenando',
    Icon: Sprout,
  },
  {
    value: 'intermediate',
    label: 'Intermedio',
    description: 'Entreno regularmente hace más de 6 meses',
    Icon: Flame,
  },
  {
    value: 'advanced',
    label: 'Avanzado',
    description: 'Entreno con alta intensidad hace años',
    Icon: Trophy,
  },
];

const TOTAL_STEPS = 3;

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
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === 2 ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* Title & subtitle */}
        <Text style={styles.title}>¿Cuál es tu nivel?</Text>
        <Text style={styles.subtitle}>
          Ajustaremos la dificultad de las rutinas sugeridas.
        </Text>

        {/* Level cards */}
        <Controller
          control={control}
          name="experienceLevel"
          render={({ field: { onChange, value } }) => (
            <View style={styles.cardsContainer}>
              {LEVELS.map((level) => {
                const isSelected = value === level.value;
                return (
                  <TouchableOpacity
                    key={level.value}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() => onChange(level.value)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={level.label}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.cardIcon}>
                      <level.Icon
                        size={24}
                        color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                        strokeWidth={1.5}
                      />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                        {level.label}
                      </Text>
                      <Text style={styles.cardDescription}>{level.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {errors.experienceLevel ? (
                <Text style={styles.errorText}>{errors.experienceLevel.message}</Text>
              ) : null}
            </View>
          )}
        />

        {/* Buttons */}
        <View style={styles.footer}>
          <PrimaryButton label="Continuar" onPress={handleSubmit(onSubmit)} />
          <SecondaryButton label="Volver" onPress={() => navigation.navigate('BasicData')} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },

  /* Progress dots */
  dotsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  dotInactive: {
    backgroundColor: theme.colors.border,
  },

  /* Title & subtitle */
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.md,
  },

  /* Cards */
  cardsContainer: {
    flex: 1,
    width: '100%',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },

  /* Card icon */
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Card text */
  cardText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  cardTitleSelected: {
    color: theme.colors.primary,
  },
  cardDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },

  /* Error */
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'center',
  },

  /* Footer */
  footer: {
    width: '100%',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});
