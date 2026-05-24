import React, { useState } from 'react';
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
import { ArrowLeft, Bell } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useNotifications, useMarkAsRead } from '@/features/reminders/hooks/use-notifications';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { RemindersStackParamList } from '@/navigation/types';
import type { InAppNotification } from '@/features/reminders/types/notification';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<RemindersStackParamList, 'NotificationList'>;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

function NotificationItem({
  notification,
  onPress,
}: {
  notification: InAppNotification;
  onPress: () => void;
}) {
  const isUnread = !notification.readAt;
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <BaseCard style={[styles.notifCard, isUnread && styles.notifCardUnread]}>
        <View style={[styles.dot, isUnread ? styles.dotUnread : styles.dotRead]} />
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}>
            {notification.title}
          </Text>
          <Text style={styles.notifBody}>{notification.body}</Text>
          <Text style={styles.notifTime}>{timeAgo(notification.createdAt)}</Text>
        </View>
      </BaseCard>
    </TouchableOpacity>
  );
}

export default function NotificationListScreen({ navigation }: Props) {
  const notificationsQuery = useNotifications();
  const markAsRead = useMarkAsRead();
  const notifications = notificationsQuery.data ?? [];
  const [testing, setTesting] = useState(false);

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      const res = await apiClient.post<{ ok: boolean; message: string }>(API_ENDPOINTS.notifications.test);
      Alert.alert('✅ Enviada', res.message);
      notificationsQuery.refetch();
    } catch (err: any) {
      Alert.alert('❌ Error', err?.message ?? 'No se pudo enviar');
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerLink}
            onPress={() => navigation.navigate('ReminderList')}
          >
            <Text style={styles.headerLinkText}>⏰</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
            disabled={testing}
          >
            <Text style={styles.testButtonText}>{testing ? '...' : 'Test'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={notificationsQuery.isRefetching}
            onRefresh={notificationsQuery.refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {notificationsQuery.isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {notificationsQuery.isError && (
          <BaseCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Error al cargar notificaciones</Text>
            <PrimaryButton label="Reintentar" onPress={() => notificationsQuery.refetch()} />
          </BaseCard>
        )}

        {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 && (
          <BaseCard style={styles.emptyCard}>
            <Bell size={42} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptyText}>Aquí aparecerán los avisos de tus entrenamientos.</Text>
          </BaseCard>
        )}

        {!notificationsQuery.isLoading &&
          !notificationsQuery.isError &&
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onPress={() => {
                if (!n.readAt) {
                  markAsRead.mutate(n.id);
                }
              }}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxxl, gap: theme.spacing.md },
  center: { paddingVertical: theme.spacing.xxxl, alignItems: 'center' },
  emptyCard: { alignItems: 'center', gap: theme.spacing.md },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
  notifCard: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  notifCardUnread: {
    borderColor: theme.colors.primary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  dotUnread: {
    backgroundColor: theme.colors.primary,
  },
  dotRead: {
    backgroundColor: theme.colors.textMuted,
  },
  notifContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  notifTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
  },
  notifTitleUnread: {
    color: theme.colors.primary,
  },
  notifBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
  },
  notifTime: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerLink: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLinkText: {
    fontSize: 16,
  },
  testButton: {
    width: 50,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '700',
  },
});
