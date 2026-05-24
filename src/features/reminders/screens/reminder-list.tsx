import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, Plus, ArrowLeft } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useReminders, useDeleteReminder } from '@/features/reminders/hooks/use-reminders';
import ReminderCard from '@/features/reminders/components/ReminderCard';
import type { RemindersStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<RemindersStackParamList, 'ReminderList'>;

export default function ReminderListScreen({ navigation }: Props) {
  const remindersQuery = useReminders();
  const deleteReminder = useDeleteReminder();
  const reminders = remindersQuery.data ?? [];

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar recordatorio',
      '¿Estás seguro? Se cancelarán las futuras activaciones.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteReminder.mutate(id),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Recordatorios</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('ReminderCreate')}
        >
          <Plus size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={remindersQuery.isRefetching}
            onRefresh={remindersQuery.refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {remindersQuery.isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {remindersQuery.isError && (
          <BaseCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Error al cargar recordatorios</Text>
            <PrimaryButton label="Reintentar" onPress={() => remindersQuery.refetch()} />
          </BaseCard>
        )}

        {!remindersQuery.isLoading && !remindersQuery.isError && reminders.length === 0 && (
          <BaseCard style={styles.emptyCard}>
            <Bell size={42} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin recordatorios</Text>
            <Text style={styles.emptyText}>
              Agrega un recordatorio para recibir avisos de tus entrenamientos.
            </Text>
            <PrimaryButton
              label="Crear recordatorio"
              onPress={() => navigation.navigate('ReminderCreate')}
            />
          </BaseCard>
        )}

        {!remindersQuery.isLoading && !remindersQuery.isError &&
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onPress={() => navigation.navigate('ReminderEdit', { reminderId: reminder.id })}
              onDelete={() => handleDelete(reminder.id)}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  center: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
});
