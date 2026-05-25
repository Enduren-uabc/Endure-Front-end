import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

function SkeletonBlock({ width = '100%', height = 16, borderRadius = 6 }: { width?: ViewStyle['width']; height?: number; borderRadius?: number }) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: theme.colors.surfaceElevated,
      }}
    />
  );
}

export function SkeletonGreeting() {
  return (
    <View style={styles.greeting}>
      <SkeletonBlock width="60%" height={28} borderRadius={8} />
      <SkeletonBlock width="40%" height={18} borderRadius={6} />
    </View>
  );
}

export function SkeletonTodayCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBlock width={48} height={48} borderRadius={24} />
        <View style={styles.column}>
          <SkeletonBlock width="30%" height={14} borderRadius={4} />
          <SkeletonBlock width="70%" height={22} borderRadius={6} />
          <SkeletonBlock width="50%" height={14} borderRadius={4} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={48} borderRadius={12} />
    </View>
  );
}

export function SkeletonInProgressCard() {
  return (
    <View style={[styles.card, { borderColor: theme.colors.primary, borderWidth: 1 }]}>
      <View style={styles.row}>
        <SkeletonBlock width={48} height={48} borderRadius={24} />
        <View style={styles.column}>
          <SkeletonBlock width="40%" height={14} borderRadius={4} />
          <SkeletonBlock width="60%" height={22} borderRadius={6} />
          <SkeletonBlock width="50%" height={14} borderRadius={4} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={48} borderRadius={12} />
    </View>
  );
}

export function SkeletonMetricCards() {
  return (
    <View style={styles.metricsRow}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.metricCard}>
          <SkeletonBlock width="50%" height={12} borderRadius={4} />
          <SkeletonBlock width="70%" height={28} borderRadius={6} />
          <SkeletonBlock width="80%" height={12} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonStreakCard() {
  return (
    <View style={styles.streakCard}>
      <SkeletonBlock width={44} height={44} borderRadius={22} />
      <View style={styles.column}>
        <SkeletonBlock width="60%" height={18} borderRadius={6} />
        <SkeletonBlock width="80%" height={14} borderRadius={4} />
      </View>
      <View style={styles.dotsRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBlock key={i} width={6} height={6} borderRadius={3} />
        ))}
      </View>
    </View>
  );
}

export function SkeletonTrainerCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBlock width={44} height={44} borderRadius={22} />
        <View style={styles.column}>
          <SkeletonBlock width="50%" height={18} borderRadius={6} />
          <SkeletonBlock width="90%" height={14} borderRadius={4} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={48} borderRadius={12} />
    </View>
  );
}

export function SkeletonRoutineCards() {
  return (
    <View style={styles.routinesRow}>
      {Array.from({ length: 2 }).map((_, i) => (
        <View key={i} style={styles.routineCard}>
          <SkeletonBlock width="100%" height={140} borderRadius={0} />
          <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
            <SkeletonBlock width="70%" height={20} borderRadius={6} />
            <SkeletonBlock width="90%" height={14} borderRadius={4} />
            <View style={styles.tagRow}>
              <SkeletonBlock width={50} height={20} borderRadius={10} />
              <SkeletonBlock width={60} height={20} borderRadius={10} />
              <SkeletonBlock width={70} height={20} borderRadius={10} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    gap: 6,
  },
  card: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  routinesRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingRight: theme.spacing.xl,
  },
  routineCard: {
    width: 220,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
});
