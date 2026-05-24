import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Save } from 'lucide-react-native';
import { theme } from '@/theme';
import { useClientAssignedRoutines, useEditAssignedRoutineContent } from '@/features/trainer-link/hooks/use-assigned-routines';
import type { ClientsStackParamList } from '@/navigation/types';

type EditRoutineRouteProp = RouteProp<ClientsStackParamList, 'EditAssignedRoutine'>;

export default function EditAssignedRoutineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList, 'EditAssignedRoutine'>>();
  const route = useRoute<EditRoutineRouteProp>();
  const { clientId, assignedId } = route.params;

  const { data: routines, isLoading } = useClientAssignedRoutines(clientId);
  const editMutation = useEditAssignedRoutineContent(clientId, assignedId);

  const current = routines?.find((r) => r.id === assignedId);
  const [name, setName] = useState(current?.routineName ?? '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'La rutina debe tener un nombre.');
      return;
    }
    editMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          Alert.alert('Guardado', 'La rutina se actualizó correctamente.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: () => {
          Alert.alert('Error', 'No pudimos guardar los cambios. Intenta de nuevo.');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Rutina</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Nombre de la rutina</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre de la rutina"
          placeholderTextColor="#A0A0B0"
          maxLength={100}
        />

        <Text style={styles.hint}>
          Para editar días y ejercicios, usa la opción Reemplazar con una rutina modificada.
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, editMutation.isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={editMutation.isPending}
        >
          {editMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Save size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  hint: {
    fontSize: 13,
    color: '#A0A0B0',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
