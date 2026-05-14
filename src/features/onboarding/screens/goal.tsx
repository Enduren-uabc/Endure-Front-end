import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/navigation/types';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { theme } from '@/theme';

const GOALS = [
  { value: 'lose_weight' as const, label: 'Perder peso' },
  { value: 'gain_muscle' as const, label: 'Ganar musculo' },
  { value: 'maintain' as const, label: 'Mantenerme en forma' },
  { value: 'improve_endurance' as const, label: 'Mejorar resistencia' },
  { value: 'general_fitness' as const, label: 'Fitness general' },
];

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Goal'>;

export default function OnboardingGoalScreen({ navigation }: Props) {
  const mainGoal = useOnboardingStore((s) => s.mainGoal);
  const setMainGoal = useOnboardingStore((s) => s.setMainGoal);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Paso 1 de 4</Text>
          <Text style={styles.title}>Objetivo principal</Text>
          <Text style={styles.subtitle}>
            Elige la meta que mejor describe tu entrenamiento actual.
          </Text>
        </View>

        <View style={styles.chipsContainer}>
          {GOALS.map((goal) => (
            <View key={goal.value} style={styles.chipWrapper}>
              <Chip
                label={goal.label}
                selected={mainGoal === goal.value}
                onPress={() => setMainGoal(goal.value)}
              />
            </View>
          ))}
        </View>

        <PrimaryButton
          label="Continuar"
          onPress={() => navigation.navigate('BasicData')}
          disabled={!mainGoal}
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'space-between',
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
  chipsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    gap: theme.spacing.md,
  },
  chipWrapper: {
    minWidth: '45%',
    flexGrow: 1,
  },
});
