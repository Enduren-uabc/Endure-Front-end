import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface Step {
  label: string;
}

const STEPS_BASE: Step[] = [
  { label: 'Objetivo' },
  { label: 'Datos' },
  { label: 'Nivel' },
  { label: 'Resumen' },
];

const STEPS_WITH_SOCIAL: Step[] = [
  { label: 'Objetivo' },
  { label: 'Datos' },
  { label: 'Nivel' },
  { label: 'Social' },
  { label: 'Resumen' },
];

interface Props {
  currentStep: number;
  showSocial?: boolean;
}

export function OnboardingStepIndicator({ currentStep, showSocial }: Props) {
  const steps = showSocial ? STEPS_WITH_SOCIAL : STEPS_BASE;
  const total = steps.length;

  return (
    <View style={styles.container}>
      <View style={styles.pillsRow}>
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isPast = stepNum < currentStep;
          return (
            <View
              key={step.label}
              style={[
                styles.pill,
                isActive && styles.pillActive,
                isPast && styles.pillPast,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive && styles.pillTextActive,
                  isPast && styles.pillTextPast,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.stepLabel}>Paso {currentStep} de {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },
  pillActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  pillPast: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
    opacity: 0.5,
  },
  pillText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '600',
  },
  pillTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  pillTextPast: {
    color: theme.colors.primary,
  },
  stepLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
