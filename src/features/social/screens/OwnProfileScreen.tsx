import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { UserCircle } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { fetchMe } from '@/features/auth/hooks/use-auth';
import { theme } from '@/theme';

export default function OwnProfileScreen() {
  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: 1,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Cuenta</Text>
        <Text style={styles.title}>Mi perfil</Text>
        <Text style={styles.subtitle}>Tu identidad dentro de Endure.</Text>
      </View>

      <View style={styles.content}>
        {me.isLoading ? (
          <BaseCard>
            <View style={styles.centerBlock}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.mutedText}>Cargando perfil...</Text>
            </View>
          </BaseCard>
        ) : null}

        {me.isError ? (
          <BaseCard>
            <View style={styles.centerBlock}>
              <Text style={styles.errorText}>No pudimos cargar tu perfil.</Text>
              <PrimaryButton label="Reintentar" onPress={() => void me.refetch()} />
            </View>
          </BaseCard>
        ) : null}

        {me.data ? (
          <BaseCard style={styles.profileCard}>
            <View style={styles.avatarFallback}>
              <UserCircle color={theme.colors.primary} size={48} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{me.data.username}</Text>
              <Text style={styles.email}>{me.data.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{me.data.role}</Text>
              </View>
            </View>
          </BaseCard>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  kicker: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
    marginTop: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginTop: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.lg,
  },
  centerBlock: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  profileCard: {
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileText: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  email: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  roleBadge: {
    backgroundColor: `${theme.colors.primary}24`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  roleText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
