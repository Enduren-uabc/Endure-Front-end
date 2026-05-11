import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { theme } from '@/theme';

interface BaseCardProps extends ViewProps {
  children: React.ReactNode;
}

export function BaseCard({ children, style, ...rest }: BaseCardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
  },
});
