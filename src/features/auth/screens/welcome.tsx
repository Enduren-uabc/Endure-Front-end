import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { useGoogleAuth, useAppleAuth } from '@/features/auth/hooks/use-social-auth';

const LogoImage = require('../../../../assets/Logo.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { login: googleLogin, isPending: googlePending, error: googleError, clearError } = useGoogleAuth();
  const { login: appleLogin, isPending: applePending, error: appleError } = useAppleAuth();

  React.useEffect(() => {
    if (!googleError) return;

    navigation.navigate('OAuthError', {
      provider: 'google',
      reason: googleError.includes('Cancelaste') ? 'cancelled' : 'failed',
      message: googleError,
    });
    clearError();
  }, [clearError, googleError, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Image
            source={LogoImage}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo de Endure"
            accessible
          />
          <Text style={styles.title}>Endure</Text>
          <Text style={styles.subtitle}>Tu compañero de entrenamiento</Text>
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={googleLogin}
            disabled={googlePending}
            activeOpacity={0.8}
          >
            {googlePending ? (
              <ActivityIndicator size="small" color={theme.colors.textPrimary} />
            ) : (
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.appleButton}
              onPress={appleLogin}
              disabled={applePending}
              activeOpacity={0.8}
            >
              {applePending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.appleButtonText}>Continuar con Apple</Text>
              )}
            </TouchableOpacity>
          )}

          {googleError && (
            <Text style={styles.errorText}>{googleError}</Text>
          )}
          {appleError && (
            <Text style={styles.errorText}>{appleError}</Text>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <PrimaryButton label="Comenzar" onPress={() => navigation.navigate('Register')} />
          <SecondaryButton label="Ya tengo cuenta" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.display.fontSize,
    lineHeight: theme.typography.display.lineHeight,
    fontWeight: theme.typography.display.fontWeight,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  ctaSection: {
    gap: theme.spacing.md,
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    gap: theme.spacing.sm,
    minHeight: 48,
  },
  googleButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 14,
    gap: theme.spacing.sm,
    minHeight: 48,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
});
