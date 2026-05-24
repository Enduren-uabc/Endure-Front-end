import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, BarChart3, AlertCircle } from 'lucide-react-native';
import { theme } from '@/theme';
import { useClientExerciseProgress } from '@/features/trainer-link/hooks/use-client-progress';
import type { ClientsStackParamList } from '@/navigation/types';
import type { ExerciseProgressRecord } from '@/features/trainer-link/types/trainer-link';

type ExerciseProgressRouteProp = RouteProp<ClientsStackParamList, 'ExerciseProgress'>;

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function ExerciseProgressScreen() {
  const navigation = useNavigation();
  const route = useRoute<ExerciseProgressRouteProp>();
  const { clientId, exerciseId, exerciseName } = route.params;
  const { data, isLoading, isError, refetch } = useClientExerciseProgress(clientId, exerciseId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exerciseName}</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>No pudimos cargar el progreso del ejercicio</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}

      {data && !data.sufficientData && (
        <View style={styles.center}>
          <BarChart3 size={48} color={theme.colors.textMuted} />
          <Text style={styles.insufficientTitle}>Datos insuficientes</Text>
          <Text style={styles.insufficientText}>
            {data.message ?? 'Se requieren al menos 2 registros para mostrar progreso comparativo.'}
          </Text>
        </View>
      )}

      {data && data.sufficientData && (
        <FlatList
          data={data.records}
          keyExtractor={(item: ExerciseProgressRecord) => item.sessionId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.recordCard}>
              <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
              <View style={styles.recordRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Peso</Text>
                  <Text style={styles.statValue}>{item.weightUsed} kg</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Reps</Text>
                  <Text style={styles.statValue}>{item.repsPerformed}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Sets</Text>
                  <Text style={styles.statValue}>{item.setsCompleted}/{item.totalSets}</Text>
                </View>
              </View>
            </View>
          )}
          ListHeaderComponent={() => (
            <Text style={styles.sectionTitle}>Historial de progreso</Text>
          )}
        />
      )}
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
    flex: 1,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: '#0A0A0F',
    fontWeight: '700',
  },
  insufficientTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  insufficientText: {
    fontSize: 14,
    color: '#A0A0B0',
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  recordCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  recordDate: {
    fontSize: 13,
    color: '#A0A0B0',
    fontWeight: '500',
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#A0A0B0',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
