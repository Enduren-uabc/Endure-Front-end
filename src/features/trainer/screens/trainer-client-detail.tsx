import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  BarChart3,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Eye,
} from 'lucide-react-native';
import { theme } from '@/theme';
import { useClientGeneralInfo, useRecentSessions, useBasicIndicators } from '@/features/trainer-link/hooks/use-client-progress';
import { useClientAssignedRoutines } from '@/features/trainer-link/hooks/use-assigned-routines';
import type { ClientsStackParamList } from '@/navigation/types';
import type { RecentSession } from '@/features/trainer-link/types/trainer-link';

type ClientDetailRouteProp = RouteProp<ClientsStackParamList, 'ClientDetail'>;

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function SectionLoading() {
  return <ActivityIndicator size="small" color={theme.colors.primary} style={styles.sectionLoading} />;
}

function SectionError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.sectionError}>
      <AlertCircle size={20} color={theme.colors.error} />
      <Text style={styles.sectionErrorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.retryLink}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function TrainerClientDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList, 'ClientDetail'>>();
  const route = useRoute<ClientDetailRouteProp>();
  const { clientId, clientName } = route.params;

  const {
    data: generalInfo,
    isLoading: loadingInfo,
    isError: errorInfo,
    refetch: refetchInfo,
  } = useClientGeneralInfo(clientId);

  const {
    data: sessions,
    isLoading: loadingSessions,
    isError: errorSessions,
    refetch: refetchSessions,
  } = useRecentSessions(clientId);

  const {
    data: indicators,
    isLoading: loadingIndicators,
    isError: errorIndicators,
    refetch: refetchIndicators,
  } = useBasicIndicators(clientId);

  const {
    data: assignedRoutines,
    isLoading: loadingRoutines,
    isError: errorRoutines,
    refetch: refetchRoutines,
  } = useClientAssignedRoutines(clientId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Cliente</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Sección: Información general */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {clientName?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
            {loadingInfo ? (
              <SectionLoading />
            ) : errorInfo ? (
              <SectionError message="No pudimos cargar la información" onRetry={() => refetchInfo()} />
            ) : (
              <View style={styles.profileInfo}>
                <Text style={styles.clientName}>{generalInfo?.clientName ?? clientName}</Text>
                <View style={styles.routineRow}>
                  <Dumbbell size={16} color="#A0A0B0" />
                  <Text style={styles.routineText}>
                    {generalInfo?.activeRoutineName
                      ? `Rutina: ${generalInfo.activeRoutineName}`
                      : 'Sin rutina activa'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Sección: Indicadores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores</Text>
          {loadingIndicators ? (
            <SectionLoading />
          ) : errorIndicators ? (
            <SectionError message="No pudimos cargar los indicadores" onRetry={() => refetchIndicators()} />
          ) : (
            <View style={styles.indicatorsRow}>
              <View style={styles.indicatorCard}>
                <Calendar size={20} color="#52B788" />
                <Text style={styles.indicatorLabel}>Última sesión</Text>
                <Text style={styles.indicatorValue}>
                  {indicators?.lastSessionDate
                    ? formatDate(indicators.lastSessionDate)
                    : 'Sin sesiones'}
                </Text>
              </View>
              <View style={styles.indicatorCard}>
                <BarChart3 size={20} color="#52B788" />
                <Text style={styles.indicatorLabel}>Total sesiones</Text>
                <Text style={styles.indicatorValue}>
                  {indicators?.completedSessionsCount ?? 0}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Sección: Historial reciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial reciente</Text>
          {loadingSessions ? (
            <SectionLoading />
          ) : errorSessions ? (
            <SectionError message="No pudimos cargar el historial" onRetry={() => refetchSessions()} />
          ) : !sessions || sessions.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Sin sesiones registradas</Text>
            </View>
          ) : (
            sessions.map((session: RecentSession) => (
              <View key={session.sessionId} style={styles.sessionCard}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionDate}>{formatShortDate(session.date)}</Text>
                  <Text style={styles.sessionRoutine}>{session.routineName}</Text>
                </View>
                <View style={styles.sessionRight}>
                  <Clock size={14} color="#A0A0B0" />
                  <Text style={styles.sessionDuration}>
                    {session.durationMinutes != null
                      ? `${session.durationMinutes} min`
                      : 'En progreso'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Sección: Rutina Asignada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rutina Asignada</Text>
          {loadingRoutines ? (
            <SectionLoading />
          ) : errorRoutines ? (
            <SectionError message="No pudimos cargar la rutina asignada" onRetry={() => refetchRoutines()} />
          ) : !assignedRoutines || assignedRoutines.length === 0 ? (
            <View style={styles.noRoutineCard}>
              <Text style={styles.noRoutineText}>Sin rutina asignada</Text>
              <Text style={styles.noRoutineSubtext}>Asigna una rutina desde tu lista disponible.</Text>
              <TouchableOpacity
                style={styles.assignButton}
                onPress={() => navigation.navigate('AssignRoutine', { clientId, clientName })}
              >
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.assignButtonText}>Asignar rutina</Text>
              </TouchableOpacity>
            </View>
          ) : (
            assignedRoutines.map((routine) => (
              <View key={routine.id} style={styles.assignedRoutineCard}>
                <View style={styles.assignedRoutineHeader}>
                  <Dumbbell size={18} color={theme.colors.primary} />
                  <Text style={styles.assignedRoutineName}>{routine.routineName}</Text>
                  {routine.originLabel && (
                    <View style={styles.originBadge}>
                      <Text style={styles.originBadgeText}>{routine.originLabel}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.assignedRoutineMeta}>
                  <Text style={styles.metaLabel}>Estado</Text>
                  <Text style={[
                    styles.metaValue,
                    routine.status === 'active' && styles.statusActive,
                    routine.status === 'replaced' && styles.statusReplaced,
                  ]}>
                    {routine.status === 'active' ? 'Activa' :
                     routine.status === 'replaced' ? 'Reemplazada' : 'Inactiva'}
                  </Text>
                </View>
                <View style={styles.assignedRoutineMeta}>
                  <Text style={styles.metaLabel}>Ejercicios</Text>
                  <Text style={styles.metaValue}>{routine.exerciseCount}</Text>
                </View>
                {routine.status === 'active' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        navigation.navigate('EditAssignedRoutine', {
                          clientId,
                          clientName,
                          assignedId: routine.id,
                          routineName: routine.routineName,
                        })
                      }
                    >
                      <Text style={styles.editButtonText}>Editar nombre</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={() => navigation.navigate('AssignRoutine', { clientId, clientName })}
                    >
                      <RefreshCw size={16} color={theme.colors.primary} />
                      <Text style={styles.replaceButtonText}>Reemplazar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => navigation.navigate('AssignedRoutineDetail', {
                    clientId,
                    assignedId: routine.id,
                    routineName: routine.routineName,
                  })}
                >
                  <Eye size={16} color={theme.colors.primary} />
                  <Text style={styles.detailButtonText}>Ver detalle</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Sección: Progreso por ejercicio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progreso por ejercicio</Text>
          <Text style={styles.sectionSubtext}>
            Selecciona un ejercicio para ver su evolución
          </Text>
          <TouchableOpacity
            style={styles.exercisePlaceholder}
            onPress={() => {
              /* TODO: mostrar lista de ejercicios */
            }}
          >
            <BarChart3 size={20} color={theme.colors.textMuted} />
            <Text style={styles.exercisePlaceholderText}>
          Los ejercicios aparecerán aquí cuando el cliente tenga rutina activa con sesiones registradas.
            </Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionSubtext: {
    fontSize: 13,
    color: '#A0A0B0',
    marginBottom: 12,
    lineHeight: 18,
  },
  sectionLoading: {
    paddingVertical: 24,
  },
  sectionError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  sectionErrorText: {
    fontSize: 13,
    color: '#EF4444',
    flex: 1,
  },
  retryLink: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2A2A3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routineText: {
    fontSize: 14,
    color: '#52B788',
    fontWeight: '500',
  },
  indicatorsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  indicatorCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  indicatorLabel: {
    fontSize: 11,
    color: '#A0A0B0',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  indicatorValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptySection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#A0A0B0',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  sessionLeft: {
    gap: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sessionRoutine: {
    fontSize: 12,
    color: '#A0A0B0',
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#A0A0B0',
  },
  exercisePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    borderStyle: 'dashed',
  },
  exercisePlaceholderText: {
    flex: 1,
    fontSize: 13,
    color: '#A0A0B0',
    lineHeight: 18,
  },
  noRoutineCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    borderStyle: 'dashed',
  },
  noRoutineText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noRoutineSubtext: {
    fontSize: 13,
    color: '#A0A0B0',
    textAlign: 'center',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  assignedRoutineCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  assignedRoutineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  originBadge: {
    backgroundColor: '#1A3A2E',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  originBadgeText: {
    fontSize: 11,
    color: '#52B788',
    fontWeight: '600',
  },
  assignedRoutineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  assignedRoutineMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    color: '#A0A0B0',
  },
  metaValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusActive: {
    color: '#52B788',
  },
  statusReplaced: {
    color: '#F59E0B',
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  detailButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2A2A3E',
    borderWidth: 1,
    borderColor: '#3A3A4E',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  replaceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  replaceButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
