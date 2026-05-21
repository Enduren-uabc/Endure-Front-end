import React, { useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Search, AlertCircle } from 'lucide-react-native';
import { theme } from '@/theme';
import { useMyTrainer, useDeactivateLink } from '../hooks/use-trainer-link';
import ActiveTrainerCard from '../components/active-trainer-card';
import type { TrainerLinkStackParamList } from '@/navigation/types';

export default function MyTrainerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TrainerLinkStackParamList>>();
  const { data, isLoading, isError, refetch } = useMyTrainer();
  const deactivateLink = useDeactivateLink();

  const handleDeactivate = useCallback(() => {
    if (!data?.trainer) return;
    Alert.alert(
      'Desvincularme',
      '¿Estás seguro de desvincularte de este entrenador? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincularme',
          style: 'destructive',
          onPress: () => {
            deactivateLink.mutate(
              { linkId: data.trainer!.linkId },
              {
                onSuccess: () => {
                  Alert.alert('Desvinculado', 'Te has desvinculado de tu entrenador.');
                },
                onError: (err: any) => {
                  Alert.alert('Error', err?.message ?? 'No pudimos procesar la desvinculación.');
                },
              },
            );
          },
        },
      ],
    );
  }, [data, deactivateLink]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>No pudimos cargar la información</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!data?.hasTrainer || !data?.trainer) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <User size={48} color={theme.colors.textMuted} />
          <Text style={styles.noTrainerTitle}>No tienes un entrenador vinculado</Text>
          <Text style={styles.noTrainerSubtitle}>
            Busca un entrenador por su código único y envía una solicitud de vinculación.
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('SearchTrainer')}
          >
            <Search size={18} color="#0A0A0F" />
            <Text style={styles.searchButtonText}>Buscar entrenador</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Mi Entrenador</Text>
        <ActiveTrainerCard
          data={data.trainer}
          onViewProfile={() => navigation.navigate('TrainerProfile', { trainerId: data.trainer!.trainerId })}
          onDeactivate={handleDeactivate}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  noTrainerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  noTrainerSubtitle: {
    fontSize: 14,
    color: '#A0A0B0',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  searchButtonText: {
    color: '#0A0A0F',
    fontWeight: '700',
    fontSize: 15,
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
});
