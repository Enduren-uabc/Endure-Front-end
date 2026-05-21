import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '@/navigation/types';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import {
  useCreateOnboardingProfile,
  type OnboardingProfileBody,
} from '@/features/onboarding/hooks/use-onboarding';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Perder peso',
  gain_muscle: 'Ganar musculo',
  maintain: 'Mantenerme en forma',
  improve_endurance: 'Mejorar resistencia',
  general_fitness: 'Ganar fuerza',
};

const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Summary'>;

export default function OnboardingSummaryScreen({ navigation }: Props) {
  const draft = useOnboardingStore();
  const mutation = useCreateOnboardingProfile();

  const hasRequiredData =
    !!draft.mainGoal &&
    !!draft.fullName &&
    !!draft.birthDate &&
    !!draft.gender &&
    !!draft.weight &&
    !!draft.height &&
    !!draft.experienceLevel;

  const handleConfirm = () => {
    if (!hasRequiredData) return;

    const body: OnboardingProfileBody = {
      fullName: draft.fullName as string,
      birthDate: draft.birthDate as string,
      gender: draft.gender as OnboardingProfileBody['gender'],
      weight: parseFloat(draft.weight as string),
      height: parseFloat(draft.height as string),
      experienceLevel: draft.experienceLevel as OnboardingProfileBody['experienceLevel'],
      mainGoal: draft.mainGoal as OnboardingProfileBody['mainGoal'],
      daysAvailablePerWeek: draft.daysAvailablePerWeek ?? 3,
      weightUnit: draft.weightUnit ?? 'kg',
    };

    mutation.mutate(body, {
      onSuccess: () => {
        draft.reset();
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Paso 4 de 4</Text>
          <Text style={styles.title}>Resumen</Text>
          <Text style={styles.subtitle}>Confirma tus datos para entrar a la app.</Text>
        </View>

        <BaseCard>
          <View style={styles.summaryList}>
            <SummaryRow label="Nombre" value={draft.fullName || '-'} />
            <SummaryRow label="Fecha" value={draft.birthDate || '-'} />
            <SummaryRow label="Genero" value={GENDER_LABELS[draft.gender || ''] || '-'} />
            <SummaryRow
              label="Peso"
              value={draft.weight ? `${draft.weight} ${draft.weightUnit ?? 'kg'}` : '-'}
            />
            <SummaryRow
              label="Estatura"
              value={draft.height ? `${draft.height} cm` : '-'}
            />
            <SummaryRow
              label="Nivel"
              value={LEVEL_LABELS[draft.experienceLevel || ''] || '-'}
            />
            <SummaryRow label="Objetivo" value={GOAL_LABELS[draft.mainGoal || ''] || '-'} />
          </View>
        </BaseCard>

        {!hasRequiredData ? (
          <Text style={styles.errorText}>Faltan datos para completar el onboarding.</Text>
        ) : null}
        {mutation.isError ? (
          <Text style={styles.errorText}>
            {mutation.error.message || 'Error al guardar el perfil'}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <PrimaryButton
            label="Confirmar y continuar"
            onPress={handleConfirm}
            loading={mutation.isPending}
            disabled={!hasRequiredData || mutation.isPending}
          />
          <SecondaryButton label="Volver" onPress={() => navigation.navigate('Level')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  step: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  summaryList: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  rowLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  footer: {
    gap: theme.spacing.md,
    marginTop: 'auto',
  },
});
