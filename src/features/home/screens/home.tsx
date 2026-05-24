import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  TrendingUp,
} from 'lucide-react-native';
import type { AppTabsParamList, RootStackParamList } from '@/navigation/types';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useHomeGreeting, useWeeklyStats } from '@/features/home/hooks/use-home-data';
import { useUnreadCount } from '@/features/reminders/hooks/use-notifications';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';

type HomeNavigation = BottomTabNavigationProp<AppTabsParamList, 'Home'>;

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { name, dateLabel } = useHomeGreeting();
  const { data: weeklyStats, isLoading: statsLoading } = useWeeklyStats();
  const { data: unreadData } = useUnreadCount();

  const hasStats = weeklyStats !== null && weeklyStats !== undefined;
  const unreadCount = unreadData?.count ?? 0;

  const handleNotifications = () => {
    rootNavigation.navigate('RemindersStack');
  };

  const handleCreateRoutine = () => {
    navigation.navigate('Routines', { screen: 'RoutinesList' });
  };

  const handleStartWorkout = () => {
    navigation.navigate('Workout', { screen: 'WorkoutStart' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inicio</Text>
          <TouchableOpacity
            onPress={handleNotifications}
            style={styles.notifButton}
            activeOpacity={0.7}
            accessibilityLabel="Notificaciones"
          >
            <Bell size={22} color={theme.colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hola{name ? `, ${name}` : ''}</Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>

        {/* Today's Workout */}
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>HOY</Text>
            </View>
          </View>

          <View style={styles.todayBody}>
            <View style={styles.todayIconCircle}>
              <Calendar size={24} color={theme.colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.todayEmptyTitle}>Aún no hay entrenamiento para hoy</Text>
            <Text style={styles.todayEmptyDesc}>
              Cuando tengas una rutina asignada, aparecerá aquí.
            </Text>
          </View>

          <PrimaryButton
            label="Ver mis rutinas"
            onPress={handleCreateRoutine}
          />
        </View>

        {/* Weekly Stats */}
        <Text style={styles.sectionTitle}>ESTA SEMANA</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconSlot}>
              <Dumbbell size={18} color={theme.colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.metricValue}>
              {statsLoading ? '...' : hasStats ? weeklyStats.completedWorkouts : '0'}
            </Text>
            <Text style={styles.metricLabel}>Entrenamientos</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconSlot}>
              <TrendingUp size={18} color={theme.colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.metricValue}>
              {statsLoading ? '...' : hasStats ? `${weeklyStats.totalVolumeKg}` : '0'}
            </Text>
            <Text style={styles.metricLabel}>Volumen (kg)</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconSlot}>
              <Clock size={18} color={theme.colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.metricValue}>
              {statsLoading ? '...' : hasStats ? `${weeklyStats.activeMinutes}` : '0'}
            </Text>
            <Text style={styles.metricLabel}>Min. activos</Text>
          </View>
        </View>

        {/* Streak */}
        <Text style={styles.sectionTitle}>RACHA</Text>
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Flame size={20} color={theme.colors.primary} strokeWidth={1.5} />
            <Text style={styles.streakEmptyTitle}>Aún no tienes racha</Text>
          </View>
          <Text style={styles.streakEmptyDesc}>
            Completa tu primer entrenamiento para comenzar.
          </Text>
          <View style={styles.streakDots}>
            {WEEKDAYS.map((day, i) => (
              <View key={day} style={styles.streakCircle}>
                <Text style={styles.streakDay}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* For You */}
        <Text style={styles.sectionTitle}>PARA TI</Text>
        <View style={styles.foryouCard}>
          <Text style={styles.foryouEmptyTitle}>Recomendaciones no disponibles</Text>
          <Text style={styles.foryouEmptyDesc}>
            Esta sección estará disponible cuando se implemente el módulo de rutinas
            sugeridas.
          </Text>
          <SecondaryButton
            label="Próximamente"
            onPress={() => {}}
            disabled
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.xl,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Greeting */
  greetingSection: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  greeting: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  dateLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },

  /* Today Card */
  todayCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayBadge: {
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xxs,
  },
  todayBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  todayBody: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  todayIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  todayEmptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
    textAlign: 'center',
  },
  todayEmptyDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },

  /* Section title */
  sectionTitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  /* Metrics */
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metricIconSlot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '800',
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  /* Streak */
  streakCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  streakEmptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  streakEmptyDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'center',
  },
  streakDots: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  streakCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakDay: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },

  /* For You */
  foryouCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  foryouEmptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
    textAlign: 'center',
  },
  foryouEmptyDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
