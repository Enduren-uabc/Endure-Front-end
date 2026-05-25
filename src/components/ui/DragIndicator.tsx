import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

type DragIndicatorPosition = 'above' | 'inside';

interface DragIndicatorProps {
  position?: DragIndicatorPosition;
  color?: string;
}

const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;

export function DragIndicator({
  position = 'above',
  color = theme.colors.border,
}: DragIndicatorProps) {
  return (
    <View
      style={[
        styles.handle,
        position === 'above' ? styles.positionAbove : styles.positionInside,
        { backgroundColor: color },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  handle: {
    width: HANDLE_WIDTH,
    height: HANDLE_HEIGHT,
    borderRadius: 2,
    alignSelf: 'center',
  },
  positionAbove: {
    marginTop: -theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  positionInside: {
    marginBottom: theme.spacing.xs,
  },
});
