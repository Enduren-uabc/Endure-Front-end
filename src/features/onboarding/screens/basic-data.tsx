import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar } from 'lucide-react-native';
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

const pad = (n: number) => String(n).padStart(2, '0');

const formatDateDisplay = (value: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }
  return value;
};

export default function OnboardingBasicDataScreen({ navigation }: Props) {
  const [showPicker, setShowPicker] = React.useState(false);
  const [pickerDate, setPickerDate] = React.useState(new Date());
  const draft = useOnboardingStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
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

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (date) {
      setPickerDate(date);
      const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      setValue('birthDate', formatted, { shouldValidate: true });
    }
  };

  const openPicker = (currentValue: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(currentValue)) {
      const [y, m, d] = currentValue.split('-');
      setPickerDate(new Date(Number(y), Number(m) - 1, Number(d)));
    }
    setShowPicker(true);
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
                render={({ field: { value } }) => (
                  <View style={styles.dateFieldContainer}>
                    <Text style={styles.dateLabel}>Fecha de nacimiento</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateInputWrapper,
                        errors.birthDate ? styles.dateInputError : null,
                      ]}
                      onPress={() => openPicker(value)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Seleccionar fecha de nacimiento"
                    >
                      <Text
                        style={[
                          styles.dateInputText,
                          !value ? styles.datePlaceholder : null,
                        ]}
                      >
                        {value ? formatDateDisplay(value) : 'DD/MM/AAAA'}
                      </Text>
                      <Calendar size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.birthDate ? (
                      <Text style={styles.errorText}>{errors.birthDate.message}</Text>
                    ) : null}

                    {showPicker && (
                      <>
                        {Platform.OS === 'ios' && (
                          <View style={styles.pickerHeader}>
                            <TouchableOpacity
                              onPress={() => setShowPicker(false)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Text style={styles.pickerDone}>Listo</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        <DateTimePicker
                          value={pickerDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleDateChange}
                          maximumDate={new Date()}
                          locale="es-MX"
                          themeVariant="dark"
                        />
                      </>
                    )}
                  </View>
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

  /* Date picker styles */
  dateFieldContainer: {
    width: '100%',
  },
  dateLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
    marginBottom: theme.spacing.xs,
  },
  dateInputWrapper: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  dateInputError: {
    borderColor: theme.colors.error,
  },
  dateInputText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingVertical: theme.spacing.md,
    flex: 1,
  },
  datePlaceholder: {
    color: theme.colors.textMuted,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
  },
  pickerDone: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
});
