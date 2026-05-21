import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

const LogoImage = require('../../../../assets/Logo.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
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
});
