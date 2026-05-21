import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Menu,
  Dumbbell,
  Calendar,
  Flame,
  Circle,
  TrendingUp,
  Clock,
  User,
  UserPlus,
  Inbox,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppTabsParamList } from '@/navigation/types';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useMyTrainer, useReceivedLinkRequests } from '@/features/trainer-link/hooks/use-trainer-link';

type HomeNavigation = BottomTabNavigationProp<AppTabsParamList, 'Home'>;

const COLORS = {
  darkBlue: '#101D3D',
  white: '#FFFFFF',
  lightGray: '#F2F2F7',
  mediumGray: '#9E9EAD',
  black: '#0A0A0A',
  green: '#22C55E',
  fire: '#FF8A00',
};

function useDayName(): string {
  return useMemo(() => {
    const raw = format(new Date(), 'EEEE', { locale: es });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, []);
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const dayName = useDayName();
  const role = useSessionStore((s) => s.role);
  const { data: myTrainerData } = useMyTrainer();
  const { data: receivedData } = useReceivedLinkRequests('pendiente');

  const hasTrainer = myTrainerData?.hasTrainer && myTrainerData?.trainer !== null;
  const pendingCount = receivedData?.items?.length ?? 0;

  const navigateToDrawerScreen = (screen: string, params?: any) => {
    const drawerNav = navigation.getParent();
    if (drawerNav) {
      (drawerNav as any).navigate('TrainerLinkStack', { screen, params });
    }
  };

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleVerRutinas = () => {
    navigation.navigate('Routines', { screen: 'RoutinesList' });
  };

  const handleHistorial = () => {
    navigation.navigate('Workout', { screen: 'WorkoutHistory' });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleMenuPress}
            style={styles.menuButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Menu size={24} color={COLORS.black} strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Inicio</Text>

          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Identity */}
        <View style={styles.identityCard}>
          <View style={styles.logoCircle}>
            <Dumbbell size={22} color={COLORS.darkBlue} strokeWidth={2.5} />
          </View>
          <Text style={styles.appName}>ENDURE</Text>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hola</Text>
          <Text style={styles.dayName}>{dayName}</Text>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardHeader}>
            <View style={styles.mainCardIconSlot}>
              <Calendar size={20} color={COLORS.darkBlue} strokeWidth={2} />
            </View>
            <Text style={styles.mainCardTitle}>Sin entrenamiento hoy</Text>
          </View>
          <Text style={styles.mainCardDesc}>
            Crea una rutina o activa una para comenzar a entrenar
          </Text>
          <TouchableOpacity onPress={handleVerRutinas} activeOpacity={0.6}>
            <Text style={styles.mainCardLink}>Ver rutinas</Text>
          </TouchableOpacity>
        </View>

        {/* Esta Semana */}
        <Text style={styles.sectionTitle}>ESTA SEMANA</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconSlot, { backgroundColor: '#FFF0E5' }]}>
              <Flame size={18} color={COLORS.fire} strokeWidth={2} />
            </View>
            <Text style={styles.metricValue}>2</Text>
            <Text style={styles.metricLabel}>Entrenamientos</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconSlot, { backgroundColor: '#E8F0FE' }]}>
              <Circle size={18} color={COLORS.darkBlue} strokeWidth={2} />
            </View>
            <Text style={styles.metricValue}>24</Text>
            <Text style={styles.metricLabel}>Series</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconSlot, { backgroundColor: '#E6F9ED' }]}>
              <TrendingUp size={18} color={COLORS.green} strokeWidth={2} />
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>5</Text>
              <Text style={styles.metricUnit}> dias</Text>
            </View>
            <Text style={styles.metricLabel}>Racha</Text>
          </View>
        </View>

        {/* Role-specific sections */}
        {role === 'user' && (
          <>
            <Text style={styles.sectionTitle}>MI ENTRENADOR</Text>
            {hasTrainer && myTrainerData?.trainer ? (
              <TouchableOpacity
                style={styles.trainerCard}
                onPress={() => navigateToDrawerScreen('MyTrainer')}
                activeOpacity={0.7}
              >
                <View style={styles.trainerAvatarCircle}>
                  <User size={22} color={COLORS.darkBlue} strokeWidth={2} />
                </View>
                <View style={styles.trainerInfo}>
                  <Text style={styles.trainerName}>{myTrainerData.trainer.displayName}</Text>
                  <Text style={styles.trainerCode}>{myTrainerData.trainer.trainerCode}</Text>
                </View>
                <ChevronRight size={20} color={COLORS.mediumGray} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.trainerEmptyCard}
                onPress={() => navigateToDrawerScreen('SearchTrainer')}
                activeOpacity={0.7}
              >
                <View style={[styles.trainerAvatarCircle, { backgroundColor: '#FFF0E5' }]}>
                  <UserPlus size={22} color={COLORS.fire} strokeWidth={2} />
                </View>
                <View style={styles.trainerInfo}>
                  <Text style={styles.trainerName}>Buscar entrenador</Text>
                  <Text style={styles.trainerSubtext}>
                    Vincula un entrenador para que te asigne rutinas
                  </Text>
                </View>
                <ChevronRight size={20} color={COLORS.mediumGray} />
              </TouchableOpacity>
            )}
          </>
        )}

        {role === 'trainer' && (
          <>
            <Text style={styles.sectionTitle}>SOLICITUDES</Text>
            <TouchableOpacity
              style={styles.trainerCard}
              onPress={() => navigateToDrawerScreen('ReceivedRequests')}
              activeOpacity={0.7}
            >
              <View style={[styles.trainerAvatarCircle, { backgroundColor: '#FFF0E5' }]}>
                <Inbox size={22} color={COLORS.fire} strokeWidth={2} />
              </View>
              <View style={styles.trainerInfo}>
                <Text style={styles.trainerName}>Solicitudes de vinculación</Text>
                <Text style={styles.trainerSubtext}>
                  {pendingCount > 0
                    ? `Tienes ${pendingCount} solicitud${pendingCount !== 1 ? 'es' : ''} pendiente${pendingCount !== 1 ? 's' : ''}`
                    : 'No tienes solicitudes pendientes'}
                </Text>
              </View>
              {pendingCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              )}
              <ChevronRight size={20} color={COLORS.mediumGray} />
            </TouchableOpacity>
          </>
        )}

        {/* Quick Access */}
        <TouchableOpacity
          style={styles.quickCard}
          onPress={handleVerRutinas}
          activeOpacity={0.7}
        >
          <View style={[styles.quickIconSlot, { backgroundColor: '#E8F0FE' }]}>
            <Dumbbell size={20} color={COLORS.darkBlue} strokeWidth={2} />
          </View>
          <Text style={styles.quickCardTitle}>Mis rutinas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={handleHistorial}
          activeOpacity={0.7}
        >
          <View style={[styles.quickIconSlot, { backgroundColor: '#F0F0F5' }]}>
            <Clock size={20} color="#555560" strokeWidth={2} />
          </View>
          <Text style={styles.quickCardTitle}>Historial</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  safeHeader: {
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 20,
  },

  // Identity
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkBlue,
    letterSpacing: 1.2,
  },

  // Welcome
  welcomeSection: {
    gap: 4,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.mediumGray,
  },
  dayName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.darkBlue,
    lineHeight: 38,
  },

  // Main Card
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainCardIconSlot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
    flex: 1,
  },
  mainCardDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: COLORS.mediumGray,
  },
  mainCardLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkBlue,
    alignSelf: 'flex-start',
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.mediumGray,
    letterSpacing: 1.2,
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    alignItems: 'center',
  },
  metricIconSlot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.black,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.mediumGray,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Quick Access
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  quickIconSlot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },

  // Trainer / Role Cards
  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  trainerEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  trainerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerInfo: {
    flex: 1,
    gap: 2,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  trainerCode: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.darkBlue,
  },
  trainerSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.mediumGray,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});
