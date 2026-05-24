import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, ChevronRight, Dumbbell, Search, User } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { useMyTrainer, useDeactivateLink } from '../hooks/use-trainer-link';
import ActiveTrainerCard from '../components/active-trainer-card';
import type { TrainerLinkStackParamList } from '@/navigation/types';

type TrainerLinkNavigation = NativeStackNavigationProp<TrainerLinkStackParamList, 'MyTrainer'>;

export default function MyTrainerScreen() {
  const navigation = useNavigation<TrainerLinkNavigation>();
  const { data, error, isLoading, isError, refetch } = useMyTrainer();
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
                onError: (err: Error) => {
                  Alert.alert('Error', err.message || 'No pudimos procesar la desvinculación.');
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
          <Text style={styles.centerText}>Cargando tu entrenador...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.centerTitle}>No pudimos cargar la información</Text>
          <Text style={styles.centerText}>
            {error?.message ?? 'Revisa tu conexión e intenta nuevamente.'}
          </Text>
          <PrimaryButton label="Intentar de nuevo" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data?.hasTrainer || !data?.trainer) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <User size={48} color={theme.colors.textMuted} />
          </View>
          <Text style={styles.centerTitle}>No tienes un entrenador vinculado</Text>
          <Text style={styles.centerText}>
            Busca un entrenador por su código único y envía una solicitud de vinculación.
          </Text>
          <PrimaryButton
            label="Buscar entrenador"
            onPress={() => navigation.navigate('SearchTrainer')}
            icon={<Search size={18} color={theme.colors.background} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const trainer = data.trainer;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi entrenador</Text>
          <Text style={styles.subtitle}>
            Consulta tu vínculo activo, rutina asignada y perfil profesional.
          </Text>
        </View>

        <ActiveTrainerCard
          data={trainer}
          onViewProfile={() => navigation.navigate('TrainerProfile', { trainerId: trainer.trainerId })}
          onDeactivate={handleDeactivate}
        />

        <TouchableOpacity
          style={styles.assignedRoutineCard}
          activeOpacity={0.84}
          onPress={() => navigation.navigate('AssignedRoutine')}
        >
          <View style={styles.assignedIcon}>
            <Dumbbell size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.assignedCopy}>
            <Text style={styles.assignedTitle}>Rutina asignada</Text>
            <Text style={styles.assignedText}>
              Fuerza base 3 días · lista para tu siguiente sesión
            </Text>
          </View>
          <ChevronRight size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.actions}>
          <SecondaryButton
            label="Ver perfil completo"
            onPress={() => navigation.navigate('TrainerProfile', { trainerId: trainer.trainerId })}
          />
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
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  assignedRoutineCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  assignedIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  assignedCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  assignedTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  assignedText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  actions: {
    gap: theme.spacing.md,
  },
});
