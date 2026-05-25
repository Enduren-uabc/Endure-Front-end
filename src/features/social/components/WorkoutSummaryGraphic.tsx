import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Activity, Clock, Dumbbell, Flame, Trophy } from 'lucide-react-native';
import { theme } from '@/theme';
import type { ExerciseSummary } from '../types/social.types';

const { width } = Dimensions.get('window');

interface WorkoutSummaryGraphicProps {
  summary: ExerciseSummary;
}

export function WorkoutSummaryGraphic({ summary }: WorkoutSummaryGraphicProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header con nombre de rutina */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Trophy color={theme.colors.primary} size={24} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.routineLabel}>ENTRENAMIENTO COMPLETADO</Text>
            <Text style={styles.routineName} numberOfLines={1}>
              {summary.routineName || 'Rutina Personalizada'}
            </Text>
          </View>
        </View>

        {/* Rejilla de métricas */}
        <View style={styles.grid}>
          <MetricItem 
            icon={<Dumbbell color={theme.colors.textPrimary} size={18} />} 
            value={`${summary.totalVolume.toLocaleString()} kg`} 
            label="VOLUMEN TOTAL" 
          />
          <MetricItem 
            icon={<Clock color={theme.colors.textPrimary} size={18} />} 
            value={`${summary.durationMinutes} min`} 
            label="DURACIÓN" 
          />
          <MetricItem 
            icon={<Activity color={theme.colors.textPrimary} size={18} />} 
            value={`${summary.totalExercises}`} 
            label="EJERCICIOS" 
          />
          <MetricItem 
            icon={<Flame color={theme.colors.textPrimary} size={18} />} 
            value={`${summary.totalCompletedSets}/${summary.totalSets}`} 
            label="SERIES" 
          />
        </View>

        {/* Resumen visual de ejercicios */}
        <View style={styles.footer}>
           <Text style={styles.footerText} numberOfLines={1}>
             {summary.exercises.slice(0, 3).map(e => e.exerciseName).join(' • ')}
             {summary.exercises.length > 3 ? ` + ${summary.exercises.length - 3} más` : ''}
           </Text>
        </View>
      </View>
    </View>
  );
}

function MetricItem({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <View style={styles.metricItem}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    aspectRatio: 1, // Cuadrado estilo Instagram
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderColor: `${theme.colors.primary}33`,
    justifyContent: 'space-between',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}44`,
  },
  headerText: {
    flex: 1,
  },
  routineLabel: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  routineName: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
    marginVertical: theme.spacing.xl,
  },
  metricItem: {
    width: '45%',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.borderSoft}44`,
    paddingTop: theme.spacing.md,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
