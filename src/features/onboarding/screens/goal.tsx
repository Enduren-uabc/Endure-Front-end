import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dumbbell, HeartPulse, Gauge, TrendingDown, Target } from 'lucide-react-native';
import type { OnboardingStackParamList } from '@/navigation/types';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import {
  useOnboardingStore,
  type OnboardingGoal,
} from '@/features/onboarding/stores/onboarding-store';
import { theme } from '@/theme';

interface GoalOption {
  value: OnboardingGoal;
  label: string;
  Icon: typeof Dumbbell;
}

const GOALS: GoalOption[] = [
  { value: 'general_fitness', label: 'Ganar fuerza', Icon: Dumbbell },
  { value: 'improve_endurance', label: 'Mejorar resistencia', Icon: HeartPulse },
  { value: 'gain_muscle', label: 'Ganar músculo', Icon: Gauge },
  { value: 'lose_weight', label: 'Bajar de peso', Icon: TrendingDown },
];

const TOTAL_STEPS = 3;

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Goal'>;

export default function OnboardingGoalScreen({ navigation }: Props) {
  const mainGoal = useOnboardingStore((s) => s.mainGoal);
  const setMainGoal = useOnboardingStore((s) => s.setMainGoal);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === 0 ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* Icon circle */}
        <View style={styles.iconCircle}>
          <Target size={32} color={theme.colors.primary} strokeWidth={1.5} />
        </View>

        {/* Title & subtitle */}
        <Text style={styles.title}>¿Cuál es tu objetivo?</Text>
        <Text style={styles.subtitle}>
          Personalizaremos tu experiencia según tu meta.
        </Text>

        {/* Goal grid */}
        <View style={styles.grid}>
          {GOALS.map((goal) => {
            const isSelected = mainGoal === goal.value;
            return (
              <TouchableOpacity
                key={goal.value}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setMainGoal(goal.value)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={goal.label}
                accessibilityState={{ selected: isSelected }}
              >
                <goal.Icon
                  size={28}
                  color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                  strokeWidth={1.5}
                  style={{ marginBottom: theme.spacing.sm }}
                />
                <Text
                  style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue button */}
        <View style={styles.buttonWrapper}>
          <PrimaryButton
            label="Continuar"
            onPress={() => navigation.navigate('BasicData')}
            disabled={!mainGoal}
          />
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

  /* Icon circle */
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
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

  /* Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingHorizontal: 0,
    width: '100%',
    marginBottom: theme.spacing.lg,
  },

  /* Card — borderWidth fijo en 2 para evitar desplazamiento al seleccionar */
  card: {
    width: '47%',
    paddingVertical: theme.spacing.xxl,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },

  /* Card label */
  cardLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: theme.colors.primary,
  },

  /* Button */
  buttonWrapper: {
    width: '100%',
    marginTop: 'auto',
  },
});
