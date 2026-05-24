import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "@/theme";

interface LockoutTimerProps {
  remainingLockSeconds: number;
  onCountdownEnd: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LockoutTimer({ remainingLockSeconds, onCountdownEnd }: LockoutTimerProps) {
  const [remaining, setRemaining] = useState(remainingLockSeconds);

  useEffect(() => {
    setRemaining(remainingLockSeconds);
  }, [remainingLockSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onCountdownEnd();
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, onCountdownEnd]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.title}>Cuenta bloqueada temporalmente</Text>
      <Text style={styles.description}>
        Demasiados intentos fallidos. Puedes volver a intentar en:
      </Text>
      <Text style={styles.timer}>{formatTime(remaining)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: "center",
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: "center",
  },
  timer: {
    color: theme.colors.warning,
    fontSize: 48,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: 4,
  },
});
