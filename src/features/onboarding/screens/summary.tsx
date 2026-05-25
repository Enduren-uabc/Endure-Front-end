import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, CheckCircle2, Dumbbell, Pencil, Ruler, UserRound } from 'lucide-react-native';
import type { OnboardingStackParamList } from '@/navigation/types';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import {
  useCreateOnboardingProfile,
  type OnboardingProfileBody,
} from '@/features/onboarding/hooks/use-onboarding';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Perder peso',
  gain_muscle: 'Ganar músculo',
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

  const missingBlocks = [
    !draft.mainGoal ? 'Objetivo' : null,
    !draft.fullName || !draft.birthDate || !draft.gender || !draft.weight || !draft.height
      ? 'Datos básicos'
      : null,
    !draft.experienceLevel ? 'Nivel' : null,
  ].filter((item): item is string => Boolean(item));

  const hasRequiredData = missingBlocks.length === 0;

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
      defaultTrainingStrategyKey: draft.trainingStrategyKey,
    };

    mutation.mutate(body, {
      onSuccess: () => {
        draft.reset();
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.step}>Paso 4 de 4</Text>
          <Text style={styles.title}>Resumen</Text>
          <Text style={styles.subtitle}>
            Confirma tu perfil inicial antes de entrar a Endure.
          </Text>
        </View>

        <SummaryBlock
          icon={<Dumbbell size={22} color={theme.colors.primary} />}
          title="Objetivo"
          valid={Boolean(draft.mainGoal)}
          onEdit={() => navigation.navigate('Goal')}
          rows={[
            {
              label: 'Meta principal',
              value: GOAL_LABELS[draft.mainGoal || ''] || 'Pendiente',
            },
          ]}
        />

        <SummaryBlock
          icon={<UserRound size={22} color={theme.colors.primary} />}
          title="Datos básicos"
          valid={Boolean(draft.fullName && draft.birthDate && draft.gender && draft.weight && draft.height)}
          onEdit={() => navigation.navigate('BasicData')}
          rows={[
            { label: 'Nombre', value: draft.fullName || 'Pendiente' },
            { label: 'Fecha de nacimiento', value: draft.birthDate || 'Pendiente' },
            { label: 'Género', value: GENDER_LABELS[draft.gender || ''] || 'Pendiente' },
            {
              label: 'Peso',
              value: draft.weight ? `${draft.weight} ${draft.weightUnit ?? 'kg'}` : 'Pendiente',
            },
            { label: 'Estatura', value: draft.height ? `${draft.height} cm` : 'Pendiente' },
          ]}
        />

        <SummaryBlock
          icon={<Ruler size={22} color={theme.colors.primary} />}
          title="Experiencia"
          valid={Boolean(draft.experienceLevel)}
          onEdit={() => navigation.navigate('Level')}
          rows={[
            { label: 'Nivel', value: LEVEL_LABELS[draft.experienceLevel || ''] || 'Pendiente' },
            {
              label: 'Días disponibles',
              value: `${draft.daysAvailablePerWeek ?? 3} por semana`,
            },
          ]}
        />

        {missingBlocks.length > 0 ? (
          <View style={styles.validationCard}>
            <AlertCircle size={18} color={theme.colors.error} />
            <Text style={styles.validationText}>
              Falta completar: {missingBlocks.join(', ')}.
            </Text>
          </View>
        ) : null}

        {mutation.isError ? (
          <View style={styles.validationCard}>
            <AlertCircle size={18} color={theme.colors.error} />
            <Text style={styles.validationText}>
              {mutation.error.message || 'No pudimos guardar tu perfil. Intenta de nuevo.'}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <PrimaryButton
            label={mutation.isPending ? 'Guardando' : 'Finalizar'}
            onPress={handleConfirm}
            loading={mutation.isPending}
            disabled={!hasRequiredData || mutation.isPending}
            icon={
              !mutation.isPending ? (
                <CheckCircle2 size={18} color={theme.colors.background} />
              ) : null
            }
          />
          <SecondaryButton label="Volver" onPress={() => navigation.navigate('Level')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryBlock({
  icon,
  title,
  rows,
  valid,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  rows: { label: string; value: string }[];
  valid: boolean;
  onEdit: () => void;
}) {
  return (
    <View style={[styles.block, !valid ? styles.blockInvalid : null]}>
      <View style={styles.blockHeader}>
        <View style={styles.blockTitleGroup}>
          <View style={styles.blockIcon}>{icon}</View>
          <View>
            <Text style={styles.blockTitle}>{title}</Text>
            <Text style={[styles.blockStatus, valid ? styles.statusValid : styles.statusInvalid]}>
              {valid ? 'Completo' : 'Requiere edición'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.82}>
          <Pencil size={16} color={theme.colors.primary} />
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
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
  block: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  blockInvalid: {
    borderColor: theme.colors.error,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  blockTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  blockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  blockStatus: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  statusValid: {
    color: theme.colors.success,
  },
  statusInvalid: {
    color: theme.colors.error,
  },
  editButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  editText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  rows: {
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
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    flex: 1,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  validationCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  validationText: {
    flex: 1,
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  footer: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
});
