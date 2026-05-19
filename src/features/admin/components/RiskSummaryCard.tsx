import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import type { ScoringResult } from '../types/admin-verification';

const RISK_COLORS: Record<string, string> = {
  low: theme.colors.success,
  medium: theme.colors.warning,
  high: theme.colors.error,
  critical: theme.colors.error,
};

const RISK_LABELS: Record<string, string> = {
  low: 'BAJO',
  medium: 'MEDIO',
  high: 'ALTO',
  critical: 'CRÍTICO',
};

function getProgressBarColor(score: number): string {
  if (score >= 80) return theme.colors.success;
  if (score >= 60) return theme.colors.warning;
  if (score >= 40) return '#F97316';
  return theme.colors.error;
}

interface RiskSummaryCardProps {
  scoring: ScoringResult;
}

export function RiskSummaryCard({ scoring }: RiskSummaryCardProps) {
  const color = RISK_COLORS[scoring.riskLevel] ?? theme.colors.textMuted;
  const barColor = getProgressBarColor(scoring.riskScore);

  return (
    <BaseCard style={styles.card}>
      <Text style={styles.title}>Evaluación de riesgo</Text>

      <View style={styles.scoreRow}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(scoring.riskScore, 100)}%`, backgroundColor: barColor },
              ]}
            />
          </View>
        </View>
        <Text style={[styles.scoreText, { color: barColor }]}>{scoring.riskScore}/100</Text>
      </View>

      <View style={styles.riskRow}>
        <View style={[styles.riskBadge, { backgroundColor: color + '20', borderColor: color }]}>
          <Text style={[styles.riskBadgeText, { color }]}>
            {RISK_LABELS[scoring.riskLevel] ?? scoring.riskLevel}
          </Text>
        </View>
        <Text style={styles.actionText}>
          {scoring.recommendedAction === 'quick_review' && 'Revisión rápida'}
          {scoring.recommendedAction === 'normal_review' && 'Revisión normal'}
          {scoring.recommendedAction === 'strict_review' && 'Revisión estricta'}
          {scoring.recommendedAction === 'block' && 'Bloquear'}
          {scoring.recommendedAction === 'correction' && 'Solicitar corrección'}
        </Text>
      </View>

      {scoring.positiveSignals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Señales positivas</Text>
          {scoring.positiveSignals.map((signal, i) => (
            <View key={i} style={styles.signalRow}>
              <CheckCircle2 size={14} color={theme.colors.success} />
              <Text style={styles.signalText}>{signal}</Text>
            </View>
          ))}
        </View>
      )}

      {scoring.alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas</Text>
          {scoring.alerts.map((alert, i) => (
            <View key={i} style={styles.alertRow}>
              {alert.severity === 'critical' || alert.severity === 'high' ? (
                <AlertTriangle size={14} color={theme.colors.error} />
              ) : (
                <Info size={14} color={theme.colors.warning} />
              )}
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertCode}>{alert.code}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.summary}>{scoring.summary}</Text>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressContainer: {
    flex: 1,
  },
  progressBg: {
    height: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  signalText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  alertCode: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  summary: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'monospace',
  },
});
