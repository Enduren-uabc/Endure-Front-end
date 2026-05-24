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
import { useNavigation } from '@react-navigation/native';
import { Dumbbell, AlertCircle, ChevronRight, User } from 'lucide-react-native';
import { theme } from '@/theme';
import { useMyAssignedRoutines } from '@/features/trainer-link/hooks/use-assigned-routines';
import type { MyAssignedRoutineItem } from '@/features/trainer-link/types/trainer-link';

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function MyAssignedRoutinesScreen() {
  const navigation = useNavigation();
  const { data: routines, isLoading, isError, refetch } = useMyAssignedRoutines();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rutinas de mi Entrenador</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>No pudimos cargar tus rutinas asignadas</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : !routines || routines.length === 0 ? (
        <View style={styles.center}>
          <User size={48} color="#A0A0B0" />
          <Text style={styles.emptyText}>Sin rutinas asignadas</Text>
          <Text style={styles.emptySubtext}>
            Tu entrenador aún no te ha asignado rutinas. Cuando lo haga, aparecerán aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: MyAssignedRoutineItem }) => (
            <View style={styles.routineCard}>
              <View style={styles.routineHeader}>
                <Dumbbell size={20} color={theme.colors.primary} />
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{item.routineName}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.originLabel}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.routineMeta}>
                <Text style={styles.metaText}>
                  {item.difficulty === 'beginner' ? 'Principiante' :
                   item.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                  {' · '}{item.estimatedDuration} min
                </Text>
                <Text style={styles.metaText}>{item.exercises.length} ejercicios</Text>
              </View>

              <Text style={styles.dateText}>Asignada el {formatDate(item.assignedAt)}</Text>
            </View>
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
    width: 80,
  },
  backText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2A2A3E',
    borderRadius: 8,
  },
  retryText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#A0A0B0',
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  routineCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 10,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routineInfo: {
    flex: 1,
    gap: 4,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A3E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  badgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  routineMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#A0A0B0',
  },
  dateText: {
    fontSize: 12,
    color: '#6B6B80',
  },
});
