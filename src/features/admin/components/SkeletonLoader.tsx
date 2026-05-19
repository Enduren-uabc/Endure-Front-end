import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={44} height={44} borderRadius={22} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <SkeletonLoader width="80%" height={14} />
        <SkeletonLoader width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
      <SkeletonLoader width={120} height={24} borderRadius={6} style={{ marginTop: 12 }} />
    </View>
  );
}

export function SkeletonDetail() {
  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={styles.detailHeaderText}>
          <SkeletonLoader width="50%" height={18} />
          <SkeletonLoader width="30%" height={14} style={{ marginTop: 6 }} />
        </View>
        <SkeletonLoader width={80} height={24} borderRadius={8} />
      </View>

      <View style={styles.detailSection}>
        <SkeletonLoader width="40%" height={16} />
        <SkeletonLoader width="30%" height={14} style={{ marginTop: 12 }} />
        <SkeletonLoader width="50%" height={14} style={{ marginTop: 8 }} />
        <SkeletonLoader width="100%" height={40} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.detailSection}>
        <SkeletonLoader width="40%" height={16} />
        <View style={styles.detailRow}>
          <SkeletonLoader width={40} height={40} borderRadius={8} />
          <View style={{ flex: 1, gap: 4 }}>
            <SkeletonLoader width="50%" height={14} />
            <SkeletonLoader width="70%" height={12} />
          </View>
          <SkeletonLoader width={60} height={32} borderRadius={8} />
        </View>
      </View>

      <View style={styles.detailSection}>
        <SkeletonLoader width="40%" height={16} />
        <SkeletonLoader width="100%" height={80} borderRadius={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardBody: {},
  detailContainer: {
    padding: 20,
    gap: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailHeaderText: {
    flex: 1,
  },
  detailSection: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
});
