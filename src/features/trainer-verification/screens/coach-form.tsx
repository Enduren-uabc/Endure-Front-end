import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, FileText, Trash2, CheckCircle2, ChevronLeft, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useSpecialtyCatalog, useSubmitVerification, useUpdateVerification } from '@/features/trainer-verification/hooks/use-trainer-verification';
import { useCoachDraftStore } from '@/features/trainer-verification/stores/coach-draft-store';
import { coachFormSchema } from '@/features/trainer-verification/validations/trainer-verification';
import type { CoachStackParamList } from '@/navigation/types';
import type { FileInfo, DocumentType } from '@/features/trainer-verification/types/trainer-verification';
import { theme } from '@/theme';

type CoachNav = NativeStackNavigationProp<CoachStackParamList>;
type RouteParams = { isResubmit?: boolean } | undefined;

const STEPS = ['Información', 'Certificados', 'Documentos'];
const DOC_TYPES: { key: DocumentType; label: string }[] = [
  { key: 'ine_front', label: 'INE (Frente)' },
  { key: 'ine_back', label: 'INE (Reverso)' },
  { key: 'passport', label: 'Pasaporte' },
  { key: 'other', label: 'Otro' },
];

export default function CoachForm() {
  const navigation = useNavigation<CoachNav>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { isResubmit } = (route.params as RouteParams) ?? {};
  const [step, setStep] = useState(0);
  const draft = useCoachDraftStore();

  const { data: specialties } = useSpecialtyCatalog();
  const submitMutation = useSubmitVerification();
  const updateMutation = useUpdateVerification();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(coachFormSchema),
    defaultValues: {
      specialtyKeys: draft.specialtyKeys,
      yearsOfExperience: draft.yearsOfExperience,
      shortBio: draft.shortBio,
      idDocumentNumber: draft.idDocumentNumber,
      idDocuments: [] as { documentType: DocumentType; file: FileInfo }[],
      certificates: draft.certificateMeta.map((c) => ({
        ...c,
        file: undefined as unknown as FileInfo,
      })),
    },
  });

  const watchedSpecialtyKeys = useWatch({ control, name: 'specialtyKeys' }) ?? [];
  const watchedCertificates = useWatch({ control, name: 'certificates' }) ?? [];
  const watchedIdDocuments = useWatch({ control, name: 'idDocuments' }) ?? [];

  const saveDraft = useCallback(() => {
    const vals = getValues();
    draft.setDraft({
      specialtyKeys: vals.specialtyKeys,
      yearsOfExperience: vals.yearsOfExperience,
      shortBio: vals.shortBio,
      idDocumentNumber: vals.idDocumentNumber,
      certificateMeta: vals.certificates.map((c) => ({
        name: c.name,
        issuingOrganization: c.issuingOrganization,
      })),
    });
    Alert.alert('Borrador guardado', 'Tus datos han sido guardados localmente.');
  }, [getValues, draft]);

  const pickFile = async (type: 'image' | 'document') => {
    if (type === 'image') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.fileName ?? 'image.jpg',
          type: asset.mimeType ?? 'image/jpeg',
          size: asset.fileSize,
        } as FileInfo;
      }
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType ?? 'application/octet-stream',
          size: asset.size,
        } as FileInfo;
      }
    }
    return null;
  };

  const onSubmit = handleSubmit((data) => {
    Keyboard.dismiss();
    const payload = {
      specialtyKeys: data.specialtyKeys,
      yearsOfExperience: data.yearsOfExperience,
      shortBio: data.shortBio,
      idDocumentNumber: data.idDocumentNumber,
      idDocuments: data.idDocuments,
      certificates: data.certificates as { name: string; issuingOrganization: string; file: FileInfo }[],
    };

    const onSuccess = () => {
      draft.clearDraft();
      navigation.replace('CoachStatus');
    };
    const onError = (err: any) => {
      Alert.alert('Error', err.message || 'Ocurrió un problema al enviar.');
    };

    if (isResubmit) {
      updateMutation.mutate(payload, { onSuccess, onError });
    } else {
      submitMutation.mutate(payload, { onSuccess, onError });
    }
  });

  const canGoNext = () => {
    if (step === 0) {
      const vals = getValues();
      return (
        (vals.specialtyKeys?.length ?? 0) > 0 &&
        vals.yearsOfExperience !== undefined &&
        !isNaN(Number(vals.yearsOfExperience)) &&
        (vals.shortBio?.length ?? 0) > 0 &&
        (vals.idDocumentNumber?.length ?? 0) > 0
      );
    }
    if (step === 1) {
      return watchedCertificates.length > 0 && watchedCertificates.every((c: any) => c?.name && c?.issuingOrganization && c?.file);
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header and Stepper */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aplicación de coach</Text>
          <TouchableOpacity onPress={saveDraft} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepper}>
          {STEPS.map((label, i) => {
            const isCompleted = i < step;
            const isActive = i === step;
            return (
              <View key={label} style={styles.stepItemWrapper}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, isActive && styles.stepDotActive, isCompleted && styles.stepDotCompleted]}>
                    {isCompleted ? (
                      <CheckCircle2 size={12} color={theme.colors.background} />
                    ) : (
                      <Text style={[styles.stepNum, (isActive || isCompleted) && styles.stepNumActive]}>
                        {i + 1}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, isActive && styles.stepLabelActive, isCompleted && styles.stepLabelCompleted]}>
                    {label}
                  </Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, isCompleted && styles.stepLineActive]} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 40, 100) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && (
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Especialidades (Máx. 5)</Text>
                <View style={styles.chipsContainer}>
                  {specialties?.map((spec) => {
                    const isSelected = watchedSpecialtyKeys.includes(spec.key);
                    return (
                      <TouchableOpacity
                        key={spec.key}
                        activeOpacity={0.7}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => {
                          const current = getValues('specialtyKeys') ?? [];
                          if (current.includes(spec.key)) {
                            setValue('specialtyKeys', current.filter((k: string) => k !== spec.key), { shouldValidate: true });
                          } else if (current.length < 5) {
                            setValue('specialtyKeys', [...current, spec.key], { shouldValidate: true });
                          }
                        }}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {spec.displayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.specialtyKeys && <Text style={styles.errorText}>{errors.specialtyKeys.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Años de experiencia profesional</Text>
                <Controller
                  control={control}
                  name="yearsOfExperience"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Ej: 5"
                      placeholderTextColor={theme.colors.textMuted}
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(t) => onChange(t === '' ? undefined : parseInt(t, 10))}
                    />
                  )}
                />
                {errors.yearsOfExperience && <Text style={styles.errorText}>{errors.yearsOfExperience.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Biografía profesional</Text>
                  <Text style={styles.charCount}>{(getValues('shortBio')?.length ?? 0)}/500</Text>
                </View>
                <Controller
                  control={control}
                  name="shortBio"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      multiline
                      numberOfLines={4}
                      maxLength={500}
                      placeholder="Resume tu experiencia, métodos y logros..."
                      placeholderTextColor={theme.colors.textMuted}
                      value={value ?? ''}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.shortBio && <Text style={styles.errorText}>{errors.shortBio.message}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de identificación (INE/CURP)</Text>
                <Controller
                  control={control}
                  name="idDocumentNumber"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Para validación interna"
                      placeholderTextColor={theme.colors.textMuted}
                      value={value ?? ''}
                      onChangeText={onChange}
                      autoCapitalize="characters"
                    />
                  )}
                />
                {errors.idDocumentNumber && <Text style={styles.errorText}>{errors.idDocumentNumber.message}</Text>}
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.formSection}>
              <Text style={styles.sectionDesc}>Sube de 1 a 5 certificados que avalen tu experiencia como entrenador profesional.</Text>

              {watchedCertificates.map((cert: any, index: number) => (
                <View key={index} style={styles.fileCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Certificado {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const current = [...getValues('certificates')];
                        setValue('certificates', current.filter((_: any, i: number) => i !== index), { shouldValidate: true });
                      }}
                    >
                      <Trash2 size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[styles.input, styles.marginBottom]}
                    placeholder="Nombre del certificado"
                    placeholderTextColor={theme.colors.textMuted}
                    value={cert?.name ?? ''}
                    onChangeText={(t) => {
                      const updated = [...getValues('certificates')];
                      updated[index] = { ...updated[index], name: t };
                      setValue('certificates', updated, { shouldValidate: true });
                    }}
                  />
                  <TextInput
                    style={[styles.input, styles.marginBottom]}
                    placeholder="Organización emisora"
                    placeholderTextColor={theme.colors.textMuted}
                    value={cert?.issuingOrganization ?? ''}
                    onChangeText={(t) => {
                      const updated = [...getValues('certificates')];
                      updated[index] = { ...updated[index], issuingOrganization: t };
                      setValue('certificates', updated, { shouldValidate: true });
                    }}
                  />

                  {cert?.file ? (
                    <View style={styles.fileAttached}>
                      <View style={styles.fileAttachedInfo}>
                        <CheckCircle2 size={20} color={theme.colors.success} />
                        <View style={styles.fileAttachedText}>
                          <Text style={styles.fileName} numberOfLines={1}>{cert.file.name}</Text>
                          {cert.file.size ? (
                            <Text style={styles.fileSize}>
                              {(cert.file.size / 1024).toFixed(cert.file.size > 1024 * 1024 ? 1 : 0)} {cert.file.size > 1024 * 1024 ? 'MB' : 'KB'}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const updated = [...getValues('certificates')];
                          updated[index] = { ...updated[index], file: undefined as unknown as FileInfo };
                          setValue('certificates', updated, { shouldValidate: true });
                        }}
                        style={styles.removeFileBtn}
                      >
                        <X size={18} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={async () => {
                          const file = await pickFile('image');
                          if (file) {
                            const updated = [...getValues('certificates')];
                            updated[index] = { ...updated[index], file };
                            setValue('certificates', updated, { shouldValidate: true });
                          }
                        }}
                      >
                        <Camera size={18} color={theme.colors.textPrimary} />
                        <Text style={styles.actionText}>Tomar foto</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={async () => {
                          const file = await pickFile('document');
                          if (file) {
                            const updated = [...getValues('certificates')];
                            updated[index] = { ...updated[index], file };
                            setValue('certificates', updated, { shouldValidate: true });
                          }
                        }}
                      >
                        <FileText size={18} color={theme.colors.textPrimary} />
                        <Text style={styles.actionText}>Subir archivo</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {watchedCertificates.length < 5 && (
                <TouchableOpacity
                  style={styles.addMoreBtn}
                  onPress={() => {
                    const current = getValues('certificates') ?? [];
                    setValue('certificates', [
                      ...current,
                      { name: '', issuingOrganization: '', file: undefined as unknown as FileInfo },
                    ]);
                  }}
                >
                  <Text style={styles.addMoreText}>+ Añadir otro certificado</Text>
                </TouchableOpacity>
              )}
              {errors.certificates && <Text style={styles.errorText}>{errors.certificates.message}</Text>}
            </View>
          )}

          {step === 2 && (
            <View style={styles.formSection}>
              <Text style={styles.sectionDesc}>Sube de 1 a 3 documentos oficiales que coincidan con tu número de identificación (INE, pasaporte).</Text>

              {watchedIdDocuments.map((doc: any, index: number) => (
                <View key={index} style={styles.fileCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Documento {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const updated = [...getValues('idDocuments')];
                        setValue('idDocuments', updated.filter((_: any, i: number) => i !== index), { shouldValidate: true });
                      }}
                    >
                      <Trash2 size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.docTypeScroll}>
                    {DOC_TYPES.map((dt) => {
                      const isActive = doc?.documentType === dt.key;
                      return (
                        <TouchableOpacity
                          key={dt.key}
                          style={[styles.typeChip, isActive && styles.typeChipActive]}
                          onPress={() => {
                            const updated = [...getValues('idDocuments')];
                            updated[index] = { ...updated[index], documentType: dt.key };
                            setValue('idDocuments', updated, { shouldValidate: true });
                          }}
                        >
                          <Text style={[styles.typeChipText, isActive && styles.typeChipTextActive]}>
                            {dt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {doc?.file ? (
                    <View style={styles.fileAttached}>
                      <View style={styles.fileAttachedInfo}>
                        <CheckCircle2 size={20} color={theme.colors.success} />
                        <View style={styles.fileAttachedText}>
                          <Text style={styles.fileName} numberOfLines={1}>{doc.file.name}</Text>
                          {doc.file.size ? (
                            <Text style={styles.fileSize}>
                              {(doc.file.size / 1024).toFixed(doc.file.size > 1024 * 1024 ? 1 : 0)} {doc.file.size > 1024 * 1024 ? 'MB' : 'KB'}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          const updated = [...getValues('idDocuments')];
                          updated[index] = { ...updated[index], file: undefined as unknown as FileInfo };
                          setValue('idDocuments', updated, { shouldValidate: true });
                        }}
                        style={styles.removeFileBtn}
                      >
                        <X size={18} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={async () => {
                          const file = await pickFile('image');
                          if (file) {
                            const updated = [...getValues('idDocuments')];
                            updated[index] = {
                              ...updated[index],
                              file,
                              documentType: updated[index]?.documentType ?? 'other',
                            };
                            setValue('idDocuments', updated, { shouldValidate: true });
                          }
                        }}
                      >
                        <Camera size={18} color={theme.colors.textPrimary} />
                        <Text style={styles.actionText}>Tomar foto</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={async () => {
                          const file = await pickFile('document');
                          if (file) {
                            const updated = [...getValues('idDocuments')];
                            updated[index] = {
                              ...updated[index],
                              file,
                              documentType: updated[index]?.documentType ?? 'other',
                            };
                            setValue('idDocuments', updated, { shouldValidate: true });
                          }
                        }}
                      >
                        <FileText size={18} color={theme.colors.textPrimary} />
                        <Text style={styles.actionText}>Subir archivo</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {watchedIdDocuments.length < 3 && (
                <TouchableOpacity
                  style={styles.addMoreBtn}
                  onPress={() => {
                    const current = getValues('idDocuments') ?? [];
                    setValue('idDocuments', [
                      ...current,
                      { documentType: 'other' as DocumentType, file: undefined as unknown as FileInfo },
                    ]);
                  }}
                >
                  <Text style={styles.addMoreText}>+ Añadir otro documento</Text>
                </TouchableOpacity>
              )}
              {errors.idDocuments && <Text style={styles.errorText}>{errors.idDocuments.message}</Text>}
            </View>
          )}

        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.bottomBarInner}>
            {step > 0 ? (
              <TouchableOpacity style={styles.secondaryAction} onPress={() => setStep((s) => s - 1)}>
                <Text style={styles.secondaryActionText}>Atrás</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.spacer} />
            )}

            {step < STEPS.length - 1 ? (
              <PrimaryButton
                style={{ flex: 1, marginLeft: 16 }}
                label="Siguiente"
                onPress={() => setStep((s) => s + 1)}
                disabled={!canGoNext()}
              />
            ) : (
              <PrimaryButton
                style={{ flex: 1, marginLeft: 16 }}
                label={isResubmit ? 'Reenviar solicitud' : 'Enviar solicitud'}
                onPress={onSubmit}
                loading={submitMutation.isPending || updateMutation.isPending}
                disabled={!canGoNext()}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  saveBtn: {
    padding: 4,
  },
  saveBtnText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  stepDotCompleted: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  stepNumActive: {
    color: theme.colors.primary,
  },
  stepLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  stepLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: theme.colors.textPrimary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.surfaceElevated,
    marginHorizontal: 12,
    marginTop: -18,
  },
  stepLineActive: {
    backgroundColor: theme.colors.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    gap: 24,
  },
  sectionDesc: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 13,
    marginTop: 4,
  },
  fileCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  marginBottom: {
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  fileAttached: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(47, 224, 113, 0.08)',
    borderWidth: 1,
    borderColor: theme.colors.success,
    padding: 12,
    borderRadius: 10,
  },
  fileAttachedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  fileAttachedText: {
    flex: 1,
  },
  fileName: {
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 6,
    marginLeft: 8,
  },
  addMoreBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.textSecondary,
  },
  addMoreText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  docTypeScroll: {
    marginBottom: 16,
  },
  typeChip: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeChipActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: theme.colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  secondaryAction: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  secondaryActionText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
});
