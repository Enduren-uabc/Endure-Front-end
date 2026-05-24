import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Dumbbell, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { theme } from '@/theme';
import { useAssignedRoutineDetail } from '@/features/trainer-link/hooks/use-assigned-routines';
import type { ClientsStackParamList } from '@/navigation/types';
import type { DayDetailItem } from '@/features/trainer-link/types/trainer-link';

type DetailRouteProp = RouteProp<ClientsStackParamList, 'AssignedRoutineDetail'>;

function DayCard({ day }: { day: DayDetailItem }) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <View style={styles.dayCard}>
      <TouchableOpacity style={styles.dayHeader} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.dayTitle}>{day.dayOfWeek}</Text>
        <Text style={styles.dayCount}>{day.exercises.length} ejercicios</Text>
        {expanded ? <ChevronUp size={18} color="#A0A0B0" /> : <ChevronDown size={18} color="#A0A0B0" />}
      </TouchableOpacity>
      {expanded && day.exercises.map((ex) => (
        <View key={ex.exerciseId} style={styles.exerciseRow}>
          <Dumbbell size={16} color={theme.colors.primary} />
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            <Text style={styles.exerciseMeta}>
              {ex.sets} series x {ex.reps} reps
              {ex.restSeconds > 0 ? ` · ${ex.restSeconds}s descanso` : ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function AssignedRoutineDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList, 'AssignedRoutineDetail'>>();
  const route = useRoute<DetailRouteProp>();
  const { assignedId, clientId, routineName } = route.params;

  const { data, isLoading, isError, refetch } = useAssignedRoutineDetail(clientId, assignedId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Rutina</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color="#EF4444" />
          <Text style={styles.errorText}>No pudimos cargar el detalle de la rutina</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleSection}>
            <Text style={styles.routineTitle}>{data.routineName}</Text>
            <View style={styles.originBadge}>
              <Text style={styles.originBadgeText}>{data.originLabel}</Text>
            </View>
            <View style={styles.metaRow}>
              <Clock size={14} color="#A0A0B0" />
              <Text style={styles.metaText}>{data.estimatedDuration} min estimados</Text>
            </View>
          </View>

          {data.days.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Sin días configurados</Text>
            </View>
          ) : (
            data.days.map((day) => <DayCard key={day.dayOfWeek} day={day} />)
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A3E',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  loader: { flex: 1, justifyContent: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 24 },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center' },
  retryText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  titleSection: { marginBottom: 20, gap: 8 },
  routineTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  originBadge: { alignSelf: 'flex-start', backgroundColor: '#1A3A2E', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  originBadgeText: { fontSize: 12, color: '#52B788', fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#A0A0B0' },
  dayCard: { backgroundColor: '#1A1A2E', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A3E' },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#2A2A3E',
  },
  dayTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  dayCount: { fontSize: 12, color: '#A0A0B0', marginRight: 8 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  exerciseMeta: { fontSize: 12, color: '#A0A0B0', marginTop: 2 },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#A0A0B0' },
});
