import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export function PrimaryButton({ label, onPress, disabled, loading, loadingLabel, style, icon }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        (disabled || loading) && styles.disabled,
        loading && loadingLabel ? styles.loadingWithLabel : null,
        style,
      ]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={loading && loadingLabel ? loadingLabel : label}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      aria-busy={Boolean(loading)}
    >
      {loading ? (
        <>
          <ActivityIndicator color={theme.colors.background} aria-hidden />
          {loadingLabel ? (
            <Text style={[styles.text, styles.loadingText]} accessibilityLiveRegion="polite">
              {loadingLabel}
            </Text>
          ) : null}
        </>
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.text, icon ? { marginLeft: 8 } : null]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    minHeight: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
  },
  disabled: {
    backgroundColor: theme.colors.primaryMuted,
  },
  loadingWithLabel: {
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
  },
  text: {
    color: theme.colors.background,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
});
