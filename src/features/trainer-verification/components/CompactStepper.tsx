import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { theme } from '@/theme';

interface CompactStepperProps {
  steps: string[];
  currentStep: number;
  onStepPress?: (step: number) => void;
  canNavigate?: (step: number) => boolean;
}

export function CompactStepper({ steps, currentStep, onStepPress, canNavigate }: CompactStepperProps) {
  return (
    <View style={styles.container}>
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isPast = stepNum < currentStep;
        const isFuture = stepNum > currentStep;
        const isNavigable = canNavigate ? canNavigate(stepNum) : isPast || isActive;

        return (
          <React.Fragment key={stepNum}>
            <TouchableOpacity
              style={styles.stepWrapper}
              onPress={() => onStepPress?.(stepNum)}
              disabled={!isNavigable || isActive}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.circle,
                  isActive && styles.circleActive,
                  isPast && styles.circlePast,
                  isFuture && styles.circleFuture,
                ]}
              >
                {isPast ? (
                  <CheckCircle2 size={16} color={theme.colors.success} />
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      isActive && styles.circleTextActive,
                      isFuture && styles.circleTextFuture,
                    ]}
                  >
                    {stepNum}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  isPast && styles.labelPast,
                  isFuture && styles.labelFuture,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
            {idx < steps.length - 1 && (
              <View style={[styles.line, isPast && styles.linePast]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  stepWrapper: {
    alignItems: 'center',
    minWidth: 56,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  circleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  circlePast: {
    borderColor: theme.colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  circleFuture: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  circleText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  circleTextActive: {
    color: theme.colors.background,
  },
  circleTextFuture: {
    color: theme.colors.textMuted,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    maxWidth: 64,
    textAlign: 'center',
  },
  labelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  labelPast: {
    color: theme.colors.success,
  },
  labelFuture: {
    color: theme.colors.textMuted,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
    maxWidth: 40,
  },
  linePast: {
    backgroundColor: theme.colors.success,
  },
});
