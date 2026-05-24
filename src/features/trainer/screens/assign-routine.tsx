import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Dumbbell, AlertCircle, Check } from 'lucide-react-native';
import { theme } from '@/theme';
import { useAssignableRoutines, useAssignRoutine } from '@/features/trainer-link/hooks/use-assigned-routines';
import type { ClientsStackParamList } from '@/navigation/types';
import type { AssignableRoutineItem } from '@/features/trainer-link/types/trainer-link';

type AssignRoutineRouteProp = RouteProp<ClientsStackParamList, 'AssignRoutine'>;

export default function AssignRoutineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList, 'AssignRoutine'>>();
  const route = useRoute<AssignRoutineRouteProp>();
  const { clientId, clientName } = route.params;

  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { data: routines, isLoading, isError, refetch } = useAssignableRoutines(clientId);
  const assignMutation = useAssignRoutine(clientId);

  const handleAssign = () => {
    if (!selectedRoutineId) {
      Alert.alert('Selecciona una rutina', 'Debes seleccionar una rutina para asignar.');
      return;
    }
    assignMutation.mutate(
      { routineId: selectedRoutineId, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          Alert.alert('Rutina asignada', 'La rutina se asignó correctamente al cliente.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: () => {
          Alert.alert('Error', 'No pudimos asignar la rutina. Intenta de nuevo.');
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asignar Rutina</Text>
        <View style={styles.backButton} />
      </View>

      <Text style={styles.subtitle}>Asignar rutina a {clientName}</Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando rutinas...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>No pudimos cargar las rutinas</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : !routines || routines.length === 0 ? (
        <View style={styles.center}>
          <Dumbbell size={48} color="#A0A0B0" />
          <Text style={styles.emptyText}>No tienes rutinas disponibles</Text>
          <Text style={styles.emptySubtext}>Crea rutinas primero para poder asignarlas a tus clientes.</Text>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: AssignableRoutineItem }) => (
            <TouchableOpacity
              style={[
                styles.routineCard,
                selectedRoutineId === item.id && styles.routineCardSelected,
              ]}
              onPress={() => setSelectedRoutineId(item.id)}
            >
              <View style={styles.routineCardLeft}>
                <Dumbbell size={20} color={selectedRoutineId === item.id ? theme.colors.primary : '#A0A0B0'} />
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{item.name}</Text>
                  <Text style={styles.routineMeta}>
                    {item.exerciseCount} ejercicios · {item.estimatedDuration} min
                  </Text>
                </View>
              </View>
              {selectedRoutineId === item.id && (
                <Check size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.notesLabel}>Notas para el cliente (opcional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Ej: Empieza con peso moderado..."
                placeholderTextColor="#A0A0B0"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.assignButton, !selectedRoutineId && styles.assignButtonDisabled]}
                onPress={handleAssign}
                disabled={!selectedRoutineId || assignMutation.isPending}
              >
                {assignMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.assignButtonText}>Confirmar asignación</Text>
                )}
              </TouchableOpacity>
            </View>
          }
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
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0B0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#A0A0B0',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  routineCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#1A1A2E',
  },
  routineCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  routineInfo: {
    gap: 2,
  },
  routineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routineMeta: {
    fontSize: 12,
    color: '#A0A0B0',
  },
  footer: {
    marginTop: 16,
    gap: 12,
  },
  notesLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  assignButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  assignButtonDisabled: {
    opacity: 0.5,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
