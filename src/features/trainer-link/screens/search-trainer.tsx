import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, User, AlertCircle } from 'lucide-react-native';
import { theme } from '@/theme';
import { Chip } from '@/components/ui/Chip';
import { useSearchTrainers, useMyTrainer, useSendLinkRequest } from '../hooks/use-trainer-link';
import TrainerSearchCard from '../components/trainer-search-card';
import type { TrainerLinkStackParamList } from '@/navigation/types';
import type { TrainerSearchResult } from '../types/trainer-link';

const SPECIALTY_FILTERS = ['Todas', 'Fuerza', 'Hipertrofia', 'Cardio', 'Movilidad'];

export default function SearchTrainerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TrainerLinkStackParamList>>();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('Todas');

  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(text.trim());
    }, 300);
  }, []);

  const { data: results, isLoading, isError, refetch } = useSearchTrainers(debouncedQuery);
  const { data: myTrainer } = useMyTrainer();
  const sendRequest = useSendLinkRequest();

  const hasActiveTrainer = myTrainer?.hasTrainer && myTrainer?.trainer !== null;
  const canSendRequest = !hasActiveTrainer;
  const filteredItems = React.useMemo(() => {
    const items = results?.items ?? [];
    if (specialtyFilter === 'Todas') return items;
    return items.filter((trainer) =>
      trainer.specialties.some((specialty) =>
        specialty.toLowerCase().includes(specialtyFilter.toLowerCase()),
      ),
    );
  }, [results?.items, specialtyFilter]);

  const handleSendRequest = useCallback((trainerId: string) => {
    if (!canSendRequest) {
      Alert.alert('Ya tienes un entrenador', 'Ya tienes un entrenador vinculado. Desvincúlate primero para enviar una nueva solicitud.');
      return;
    }
    Alert.alert(
      'Enviar solicitud',
      '¿Enviar solicitud de vinculación a este entrenador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            sendRequest.mutate(
              { trainerId },
              {
                onSuccess: () => {
                  Alert.alert('Solicitud enviada', 'Tu solicitud de vinculación ha sido enviada.');
                },
                onError: (err: Error) => {
                  Alert.alert('Error', err.message || 'No pudimos enviar la solicitud.');
                },
              },
            );
          },
        },
      ],
    );
  }, [canSendRequest, sendRequest]);

  const renderItem = useCallback(({ item }: { item: TrainerSearchResult }) => (
    <TrainerSearchCard
      trainer={item}
      onSendRequest={handleSendRequest}
      onViewProfile={(trainerId) => navigation.navigate('TrainerProfile', { trainerId })}
      disabled={!canSendRequest}
    />
  ), [canSendRequest, handleSendRequest, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Buscar entrenador</Text>
        <View style={styles.inputContainer}>
          <Search size={18} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Código o nombre del entrenador..."
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={handleQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <Text style={styles.hint}>
          Ingresa el código único del entrenador (ej. END-ABC123) o su nombre
        </Text>

        <View style={styles.filters}>
          {SPECIALTY_FILTERS.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              selected={specialtyFilter === filter}
              onPress={() => setSpecialtyFilter(filter)}
            />
          ))}
        </View>

        {hasActiveTrainer && (
          <View style={styles.activeBanner}>
            <AlertCircle size={16} color={theme.colors.warning} />
            <Text style={styles.activeBannerText}>
              Ya tienes un entrenador vinculado. Desvincúlate para enviar nuevas solicitudes.
            </Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Buscando entrenadores...</Text>
          </View>
        )}

        {isError && (
          <View style={styles.center}>
            <AlertCircle size={40} color={theme.colors.error} />
            <Text style={styles.errorText}>No pudimos completar la búsqueda</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        )}

        {results && filteredItems.length === 0 && debouncedQuery.length >= 2 && (
          <View style={styles.center}>
            <User size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No se encontraron entrenadores con esa búsqueda</Text>
          </View>
        )}

        {filteredItems.length > 0 && (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.userId}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.5}
          />
        )}
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
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    height: '100%',
  },
  hint: {
    fontSize: 12,
    color: '#A0A0B0',
    marginTop: 6,
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 138, 0, 0.1)',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  activeBannerText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.warning,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#A0A0B0',
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
  emptyText: {
    fontSize: 15,
    color: '#A0A0B0',
    textAlign: 'center',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
});
