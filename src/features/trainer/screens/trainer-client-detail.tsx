import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { ClientsStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type ClientDetailRouteProp = RouteProp<ClientsStackParamList, 'ClientDetail'>;

export default function TrainerClientDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ClientDetailRouteProp>();
  const { clientName } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Cliente</Text>
        <View style={styles.backButton} />
      </View>
      <View style={styles.content}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {clientName?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{clientName}</Text>
        <Text style={styles.placeholder}>
          Próximamente: progreso del cliente, historial de sesiones e indicadores.
        </Text>
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    gap: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 14,
    color: '#A0A0B0',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});
