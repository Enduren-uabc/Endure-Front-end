import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { OnboardingStackParamList } from '@/navigation/types';
import {
  onboardingBasicDataSchema,
  type OnboardingBasicDataFormData,
} from '@/features/onboarding/validations/onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { Chip } from '@/components/ui/Chip';
import { theme } from '@/theme';

const GENDERS = [
  { value: 'male' as const, label: 'Masculino' },
  { value: 'female' as const, label: 'Femenino' },
  { value: 'other' as const, label: 'Otro' },
];

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BasicData'>;

const formatDateInput = (input: string) => {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
};

export default function OnboardingBasicDataScreen({ navigation }: Props) {
  const draft = useOnboardingStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingBasicDataFormData>({
    resolver: zodResolver(onboardingBasicDataSchema),
    defaultValues: {
      fullName: draft.fullName ?? '',
      birthDate: draft.birthDate ?? '',
      gender: draft.gender ?? undefined,
      weight: draft.weight ?? '',
      height: draft.height ?? '',
    },
  });

  const onSubmit = (data: OnboardingBasicDataFormData) => {
    draft.setBasicData(data);
    navigation.navigate('Level');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.stepRow}>
              <View style={styles.stepPill}>
                <Text style={styles.stepText}>Paso 2 de 4</Text>
              </View>
              <View style={styles.progressRow}>
                <View style={[styles.progressDot, styles.progressActive]} />
                <View style={[styles.progressDot, styles.progressActive]} />
                <View style={styles.progressDot} />
                <View style={styles.progressDot} />
              </View>
            </View>
            <Text style={styles.title}>Datos basicos</Text>
            <Text style={styles.subtitle}>
              Estos datos ayudan a ajustar las rutinas a tu perfil.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tu perfil</Text>
            <View style={styles.form}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Nombre completo"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ej. Juan Perez"
                    autoCapitalize="words"
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Fecha de nacimiento"
                    value={value}
                    onChangeText={(text) => onChange(formatDateInput(text))}
                    placeholder="YYYY-MM-DD"
                    keyboardType="numeric"
                    maxLength={10}
                    error={errors.birthDate?.message}
                  />
                )}
              />

              <View>
                <Text style={styles.label}>Genero</Text>
                <View style={styles.chipsRow}>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field: { onChange, value } }) => (
                      <>
                        {GENDERS.map((gender) => (
                          <Chip
                            key={gender.value}
                            label={gender.label}
                            selected={value === gender.value}
                            onPress={() => onChange(gender.value)}
                          />
                        ))}
                      </>
                    )}
                  />
                </View>
                {errors.gender ? (
                  <Text style={styles.errorText}>{errors.gender.message}</Text>
                ) : null}
              </View>

              <View style={styles.row}>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name="weight"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        label="Peso (kg)"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Ej. 75.5"
                        keyboardType="numeric"
                        error={errors.weight?.message}
                      />
                    )}
                  />
                </View>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name="height"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        label="Estatura (cm)"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Ej. 175"
                        keyboardType="numeric"
                        error={errors.height?.message}
                      />
                    )}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <PrimaryButton label="Continuar" onPress={handleSubmit(onSubmit)} />
            <SecondaryButton label="Volver" onPress={() => navigation.navigate('Goal')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepPill: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  stepText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  progressDot: {
    width: 18,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border,
  },
  progressActive: {
    backgroundColor: theme.colors.primary,
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
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  form: {
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
    marginBottom: theme.spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  column: {
    flex: 1,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    marginTop: theme.spacing.xs,
  },
  footer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});
