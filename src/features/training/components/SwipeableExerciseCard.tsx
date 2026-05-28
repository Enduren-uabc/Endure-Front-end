import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Dumbbell, Rows3, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import type { ExerciseConfig } from '../types/routine';

interface Props {
  exercise: ExerciseConfig;
  onPress: () => void;
  onDelete: () => void;
}

function setsCount(exercise: ExerciseConfig): number {
  return Array.isArray(exercise.sets) ? exercise.sets.length : exercise.sets;
}

export function SwipeableExerciseCard({ exercise, onPress, onDelete }: Props) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        activeOpacity={0.8}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Trash2 size={22} color={theme.colors.background} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      containerStyle={styles.swipeContainer}
    >
      <TouchableOpacity activeOpacity={0.84} onPress={onPress}>
        <BaseCard style={styles.exerciseCard}>
          <View style={styles.exerciseIcon}>
            <Dumbbell size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.exerciseBody}>
            <Text style={styles.exerciseName}>
              {exercise.order + 1}. {exercise.name}
            </Text>
            <Text style={styles.exerciseMeta}>
              {setsCount(exercise)} series
            </Text>
          </View>
          <View style={styles.exerciseStats}>
            <Rows3 size={16} color={theme.colors.textMuted} />
            <Text style={styles.exerciseStatsText}>{setsCount(exercise)}</Text>
          </View>
        </BaseCard>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseBody: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  exerciseStats: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  exerciseStatsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: theme.radius.md,
  },
});
