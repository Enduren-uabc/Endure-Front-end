import React from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Check, Trash2 } from 'lucide-react-native';
import { theme } from '@/theme';
import type { WorkoutSet } from '../types/workout-session';

interface SwipeableSetRowProps {
  set: WorkoutSet;
  target: { reps: number; weight: number };
  localValues: Record<number, { reps: string; weight: string }>;
  handleUpdateLocalValue: (setNumber: number, field: 'reps' | 'weight', val: string) => void;
  handleQuickComplete: (set: WorkoutSet) => void;
  onRemoveSet: (args: { sessionId: string; exerciseIndex: number; setNumber: number }) => void;
  sessionId: string;
  exerciseIndex: number;
  isPending: boolean;
}

export function SwipeableSetRow({
  set,
  target,
  localValues,
  handleUpdateLocalValue,
  handleQuickComplete,
  onRemoveSet,
  sessionId,
  exerciseIndex,
  isPending,
}: SwipeableSetRowProps) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-82, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        activeOpacity={0.8}
        onPress={() => {
          swipeableRef.current?.close();
          onRemoveSet({
            sessionId,
            exerciseIndex,
            setNumber: set.setNumber,
          });
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Trash2 size={16} color={theme.colors.background} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const rowContent = (
    <View style={styles.setRow}>
      <Pressable
        style={[
          styles.checkbox,
          set.completed && styles.checkboxDone,
        ]}
        onPress={() => handleQuickComplete(set)}
        disabled={isPending}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`Completar serie ${set.setNumber}`}
      >
        {set.completed ? (
          <Check size={14} color={theme.colors.background} />
        ) : null}
      </Pressable>

      <View style={[styles.setInfoInline, set.completed && styles.completedMuted]}>
        <Text style={[styles.setNumber, set.completed && styles.setNumberMuted]}>
          Serie {set.setNumber}
        </Text>
        <Text style={styles.setTargetInline}>
          Obj: {target.reps}×{target.weight}kg
        </Text>
      </View>

      <View style={[styles.inlineInputsContainer, set.completed && styles.completedMuted]}>
        {set.completed ? (
          <View style={styles.completedValuesContainer}>
            <Text style={styles.valueDone}>
              {set.repsPerformed ?? target.reps} reps
            </Text>
            <Text style={styles.valueDot}>·</Text>
            <Text style={styles.valueDone}>
              {set.weightUsed ?? target.weight} kg
            </Text>
          </View>
        ) : (
          <View style={styles.inputsRow}>
            <View style={styles.inputWrapper}>
              <RNTextInput
                style={styles.inlineInput}
                value={localValues[set.setNumber]?.weight ?? ''}
                onChangeText={(val) => handleUpdateLocalValue(set.setNumber, 'weight', val)}
                keyboardType="numeric"
                inputMode="decimal"
                placeholder={String(target.weight)}
                placeholderTextColor={theme.colors.textMuted}
                editable={!isPending}
              />
              <Text style={styles.inputSuffix}>kg</Text>
            </View>

            <View style={styles.inputWrapper}>
              <RNTextInput
                style={styles.inlineInput}
                value={localValues[set.setNumber]?.reps ?? ''}
                onChangeText={(val) => handleUpdateLocalValue(set.setNumber, 'reps', val)}
                keyboardType="numeric"
                inputMode="numeric"
                placeholder={String(target.reps)}
                placeholderTextColor={theme.colors.textMuted}
                editable={!isPending}
              />
              <Text style={styles.inputSuffix}>reps</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  if (set.completed) {
    return rowContent;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={30}
      renderRightActions={renderRightActions}
      containerStyle={styles.swipeContainer}
    >
      {rowContent}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSoft,
  },
  setRowCompleted: {
    opacity: 0.65,
  },
  completedMuted: {
    opacity: 0.65,
  },
  swipeContainer: {
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
    width: 82,
    height: '100%',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  setNumber: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  setNumberMuted: {
    color: theme.colors.textMuted,
  },
  setInfoInline: {
    flexDirection: 'column',
    width: 84,
    gap: 2,
    marginLeft: theme.spacing.sm,
  },
  setTargetInline: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
  },
  inlineInputsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  completedValuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
  },
  valueDone: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  valueDot: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xs,
    width: 72,
    height: 38,
  },
  inlineInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    padding: 0,
    textAlign: 'center',
    fontWeight: '700',
  },
  inputSuffix: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
});
