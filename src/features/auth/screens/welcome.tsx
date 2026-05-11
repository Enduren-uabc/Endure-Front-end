import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.iconCircle}>
            <Dumbbell size={48} color={theme.colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Endure</Text>
          <Text style={styles.subtitle}>Tu compañero de entrenamiento</Text>
        </View>

        <View style={styles.ctaSection}>
          <PrimaryButton label="Comenzar" onPress={() => router.push('/register')} />
          <SecondaryButton label="Ya tengo cuenta" onPress={() => router.push('/login')} />
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
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xl * 2,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xl * 2,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
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
