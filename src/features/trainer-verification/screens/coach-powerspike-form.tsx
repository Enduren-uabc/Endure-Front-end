import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CheckCircle2,
  Upload,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { NameInput } from '@/components/ui/NameInput';
import { Chip } from '@/components/ui/Chip';
import { CompactStepper } from '@/features/trainer-verification/components/CompactStepper';
import { CertificateExtractionCard, IdExtractionCard } from '@/features/trainer-verification/components/DocumentExtractionCard';
import {
  useSpecialtyCatalog,
  useMyVerificationPolling,
  usePowerspikeDraft,
  usePowerspikeUploadCertificate,
  usePowerspikeUploadIdDocument,
  usePowerspikeConfirmCertificate,
  usePowerspikeSubmit,
} from '@/features/trainer-verification/hooks/use-trainer-verification';
import type { CoachStackParamList } from '@/navigation/types';
import type { MyStatusResponse, FileInfo } from '@/features/trainer-verification/types/trainer-verification';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/theme';

type CoachNav = NativeStackNavigationProp<CoachStackParamList>;

type StepKey = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Información', 'Certificado', 'Identificación', 'Revisión'];

const STEP_FROM_STATUS: Record<string, StepKey> = {
  draft: 1,
  certificate_uploaded: 2,
  certificate_extraction_pending: 2,
  certificate_extracted: 2,
  certificate_extraction_failed: 2,
  id_uploaded: 3,
  id_extraction_pending: 3,
  id_extracted: 3,
  id_extraction_failed: 3,
  identity_compared: 4,
  risk_calculated: 4,
  correction_required: 1,
};

function determineStep(status: MyStatusResponse | undefined): StepKey {
  const adv = status?.advancedStatus;
  if (adv && STEP_FROM_STATUS[adv]) return STEP_FROM_STATUS[adv];
  return 1;
}

function needsExtractionPolling(status: MyStatusResponse | undefined): boolean {
  const adv = status?.advancedStatus;
  return adv === 'certificate_uploaded' || adv === 'certificate_extraction_pending' || adv === 'id_uploaded' || adv === 'id_extraction_pending';
}

export default function PowerspikeForm() {
  const navigation = useNavigation<CoachNav>();
  const [certUploadStarted, setCertUploadStarted] = useState(false);
  const [idUploadStarted, setIdUploadStarted] = useState(false);
  const { data: statusData } = useMyVerificationPolling(needsExtractionPolling(undefined));
  const needsPoll = certUploadStarted || idUploadStarted || needsExtractionPolling(statusData);
  const { data: pollingData } = useMyVerificationPolling(needsPoll);
  const effectiveStatus = pollingData && needsPoll ? pollingData : statusData;

  const { data: specialties } = useSpecialtyCatalog();

  const draftMutation = usePowerspikeDraft();
  const certMutation = usePowerspikeUploadCertificate();
  const confirmMutation = usePowerspikeConfirmCertificate();
  const idMutation = usePowerspikeUploadIdDocument();
  const submitMutation = usePowerspikeSubmit();

  const [currentStep, setCurrentStep] = useState<StepKey>(() => determineStep(effectiveStatus));

  useEffect(() => {
    if (effectiveStatus) {
      const step = determineStep(effectiveStatus);
      setCurrentStep(step);
    }
  }, [effectiveStatus]);

  const advStatus = effectiveStatus?.advancedStatus;

  const [specialtyKeys, setSpecialtyKeys] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [idDocumentNumber, setIdDocumentNumber] = useState('');

  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certFile, setCertFile] = useState<FileInfo | null>(null);
  const [idDocType, setIdDocType] = useState('ine_front');
  const [idFile, setIdFile] = useState<FileInfo | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<number, number>>({});

  useEffect(() => {
    const info = effectiveStatus?.extractedCertificateInfo;
    if (info) {
      setCertName((prev) => prev || info.name);
      setCertOrg((prev) => prev || info.institution);
    }
  }, [effectiveStatus?.extractedCertificateInfo]);

  useEffect(() => {
    if (
      effectiveStatus?.advancedStatus === 'certificate_extracted' ||
      effectiveStatus?.advancedStatus === 'certificate_extraction_failed' ||
      effectiveStatus?.certificateExtractionStatus === 'extracted' ||
      effectiveStatus?.certificateExtractionStatus === 'failed'
    ) {
      setCertUploadStarted(false);
    }
  }, [effectiveStatus?.advancedStatus, effectiveStatus?.certificateExtractionStatus]);

  useEffect(() => {
    if (
      effectiveStatus?.advancedStatus === 'id_extracted' ||
      effectiveStatus?.advancedStatus === 'id_extraction_failed' ||
      effectiveStatus?.idExtractionStatus === 'extracted' ||
      effectiveStatus?.idExtractionStatus === 'failed'
    ) {
      setIdUploadStarted(false);
    }
  }, [effectiveStatus?.advancedStatus, effectiveStatus?.idExtractionStatus]);

  const handleToggleSpecialty = (key: string) => {
    setSpecialtyKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : prev.length < 5 ? [...prev, key] : prev,
    );
  };

  const handleDraft = async () => {
    if (!specialtyKeys.length) {
      Alert.alert('Campos requeridos', 'Selecciona al menos una especialidad.');
      return;
    }
    if (!yearsOfExperience || Number(yearsOfExperience) < 0) {
      Alert.alert('Campos requeridos', 'Ingresa tus años de experiencia.');
      return;
    }
    if (!shortBio.trim()) {
      Alert.alert('Campos requeridos', 'Escribe una breve biografía profesional.');
      return;
    }
    try {
      await draftMutation.mutateAsync({
        specialtyKeys,
        yearsOfExperience: Number(yearsOfExperience),
        shortBio: shortBio.trim(),
      });
      goToStep(2);
    } catch {
      Alert.alert('Error', 'No pudimos guardar tu información. Intenta de nuevo.');
    }
  };

  const handleUploadCertificate = async () => {
    if (!certFile) {
      Alert.alert('Campo requerido', 'Selecciona un archivo de certificado.');
      return;
    }
    try {
      await certMutation.mutateAsync({ file: certFile });
      setCertUploadStarted(true);
    } catch {
      setCertUploadStarted(false);
      Alert.alert('Error', 'No pudimos subir el certificado. Intenta de nuevo.');
    }
  };

  const handleConfirmCertificate = async () => {
    if (!certName.trim() || !certOrg.trim()) {
      Alert.alert('Campos requeridos', 'Completa el nombre del certificado y la institución emisora.');
      return;
    }
    try {
      await confirmMutation.mutateAsync({
        certificateName: certName.trim(),
        issuingOrganization: certOrg.trim(),
      });
      goToStep(3);
    } catch {
      Alert.alert('Error', 'No pudimos guardar los datos. Intenta de nuevo.');
    }
  };

  const handleUploadId = async () => {
    if (!idFile) {
      Alert.alert('Campo requerido', 'Selecciona un archivo de identificación.');
      return;
    }
    try {
      await idMutation.mutateAsync({ idDocumentType: idDocType, file: idFile });
      setIdUploadStarted(true);
    } catch {
      setIdUploadStarted(false);
      Alert.alert('Error', 'No pudimos subir la identificación. Intenta de nuevo.');
    }
  };

  const handleSubmit = async () => {
    if (!specialtyKeys.length || !yearsOfExperience || !shortBio.trim()) {
      Alert.alert('Información incompleta', 'Completa todos los campos del paso 1 antes de enviar.');
      return;
    }
    if (idExtractionStatus === 'failed' && !idDocumentNumber.trim()) {
      Alert.alert('Campo requerido', 'Ingresa tu número de identificación oficial para continuar.');
      return;
    }
    try {
      const payload: {
        specialtyKeys: string[];
        yearsOfExperience: number;
        shortBio: string;
        idDocumentNumber?: string;
      } = {
        specialtyKeys,
        yearsOfExperience: Number(yearsOfExperience),
        shortBio: shortBio.trim(),
      };
      if (idDocumentNumber.trim()) {
        payload.idDocumentNumber = idDocumentNumber.trim();
      }
      await submitMutation.mutateAsync(payload);
      navigation.replace('PowerspikeStatus');
    } catch {
      Alert.alert('Error', 'No pudimos enviar tu solicitud. Intenta de nuevo.');
    }
  };

  const pickFile = async (type: 'image' | 'document'): Promise<FileInfo | null> => {
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
        };
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
        };
      }
    }
    return null;
  };

  const pickFromCamera = async (): Promise<FileInfo | null> => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        type: asset.mimeType ?? 'image/jpeg',
        size: asset.fileSize,
      };
    }
    return null;
  };

  const goToStep = useCallback((step: StepKey) => {
    setCurrentStep(step);
    const y = sectionRefs.current[step];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  }, []);

  const canNavigate = useCallback((step: StepKey) => step <= currentStep, [currentStep]);

  const certExtractionStatus = effectiveStatus?.certificateExtractionStatus;
  const idExtractionStatus = effectiveStatus?.idExtractionStatus;

  const renderExtractionBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return (
          <View style={[styles.badge, styles.badgePending]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.badgeTextPending}>Procesando documento...</Text>
          </View>
        );
      case 'extracted':
        return (
          <View style={[styles.badge, styles.badgeSuccess]}>
            <CheckCircle2 size={16} color={theme.colors.success} />
            <Text style={styles.badgeTextSuccess}>Documento verificado</Text>
          </View>
        );
      case 'failed':
        return (
          <View style={[styles.badge, styles.badgeError]}>
            <AlertTriangle size={16} color={theme.colors.error} />
            <Text style={styles.badgeTextError}>Error en verificación</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderStep1 = (sectionY: number) => (
    <View
      key="step1"
      onLayout={() => { sectionRefs.current[1] = sectionY; }}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>1</Text>
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          <Text style={styles.sectionSubtitle}>Cuéntanos sobre tu experiencia y perfil profesional</Text>
        </View>
      </View>

      <Text style={styles.fieldLabel}>Especialidades (máx. 5)</Text>
      <View style={styles.chipsContainer}>
        {specialties?.map((spec) => (
          <Chip
            key={spec.key}
            label={spec.displayName}
            selected={specialtyKeys.includes(spec.key)}
            onPress={() => handleToggleSpecialty(spec.key)}
          />
        ))}
      </View>

      <TextInput
        label="Años de experiencia"
        value={yearsOfExperience}
        onChangeText={setYearsOfExperience}
        keyboardType="numeric"
        placeholder="Ej: 5"
      />

      <TextInput
        label="Biografía profesional"
        value={shortBio}
        onChangeText={setShortBio}
        maxLength={500}
        placeholder="Breve descripción de tu trayectoria..."
      />

      <PrimaryButton
        label={draftMutation.isPending ? 'Guardando...' : 'Guardar y continuar'}
        onPress={handleDraft}
        disabled={draftMutation.isPending}
        loading={draftMutation.isPending}
        style={styles.stepButton}
      />
    </View>
  );

  const renderStep2 = (sectionY: number) => {
    const isUploaded = advStatus === 'certificate_uploaded';
    const isProcessing = isUploaded || advStatus === 'certificate_extraction_pending' || certExtractionStatus === 'pending';
    const isExtracted = advStatus === 'certificate_extracted' || certExtractionStatus === 'extracted';
    const isFailed = advStatus === 'certificate_extraction_failed' || certExtractionStatus === 'failed';
    const certInfo = effectiveStatus?.extractedCertificateInfo;
    const lowConfidence = certInfo && certInfo.ocrConfidence < 0.5;
    const showConfirmForm = isExtracted || isFailed || lowConfidence;
    const needsManualInput = isFailed || (isExtracted && lowConfidence);
    const hasSelectedLocalFile = !!certFile;
    const hasRemoteCertificate = isUploaded || isProcessing || isExtracted || isFailed || certExtractionStatus != null;
    const hasStartedUpload = certUploadStarted || (isProcessing && !isFailed) || isExtracted;
    const canPickCertificate = !certMutation.isPending && !isProcessing && !isExtracted && (!certUploadStarted || isFailed);
    const canUploadCertificate = hasSelectedLocalFile && !hasStartedUpload && !isExtracted;
    const displayedExtractionStatus = (certMutation.isPending || isProcessing || (certUploadStarted && !isFailed && !isExtracted))
      ? 'pending'
      : certExtractionStatus;

    return (
      <View
        key="step2"
        onLayout={() => { sectionRefs.current[2] = sectionY; }}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>2</Text>
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Certificado profesional</Text>
            <Text style={styles.sectionSubtitle}>
              {showConfirmForm
                ? 'Revisa los datos extraídos por IA'
                : 'Sube tu título o certificado profesional'}
            </Text>
          </View>
        </View>

        <View style={styles.fileSection}>
          <Text style={styles.fieldLabel}>Archivo del certificado</Text>
          <TouchableOpacity
            style={styles.filePicker}
            onPress={async () => {
              const file = await pickFile('document');
              if (file) {
                setCertFile(file);
                setCertUploadStarted(false);
              }
            }}
            disabled={!canPickCertificate}
          >
            {certFile ? (
              <View style={styles.fileInfo}>
                <FileText size={20} color={theme.colors.primary} />
                <Text style={styles.fileName}>{certFile.name}</Text>
              </View>
            ) : hasRemoteCertificate ? (
              <View style={styles.fileInfo}>
                <FileText size={20} color={theme.colors.primary} />
                <Text style={styles.fileName}>Certificado subido</Text>
              </View>
            ) : (
              <View style={styles.filePlaceholder}>
                <Upload size={20} color={theme.colors.textMuted} />
                <Text style={styles.filePlaceholderText}>Toca para seleccionar archivo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {renderExtractionBadge(displayedExtractionStatus)}

        {isExtracted && certInfo && (
          <CertificateExtractionCard data={certInfo} />
        )}

        {showConfirmForm && (
          <>
            {needsManualInput && (
              <Text style={[styles.manualInputHint]}>
                No pudimos extraer los datos con confianza suficiente. Por favor ingrésalos manualmente.
              </Text>
            )}

            <NameInput
              label="Nombre del certificado"
              value={certName}
              onChangeText={setCertName}
              placeholder="Ej: Certificación NASM-CPT"
            />
            <NameInput
              label="Institución emisora"
              value={certOrg}
              onChangeText={setCertOrg}
              placeholder="Ej: NASM"
            />
            <PrimaryButton
              label={confirmMutation.isPending ? 'Guardando...' : 'Confirmar datos'}
              onPress={handleConfirmCertificate}
              disabled={confirmMutation.isPending}
              loading={confirmMutation.isPending}
              style={styles.stepButton}
            />
          </>
        )}

        {canUploadCertificate && (
          <PrimaryButton
            label={certMutation.isPending ? 'Subiendo...' : isFailed ? 'Reintentar subida' : 'Subir certificado'}
            onPress={handleUploadCertificate}
            disabled={certMutation.isPending}
            loading={certMutation.isPending}
            style={styles.stepButton}
          />
        )}
      </View>
    );
  };

  const renderStep3 = (sectionY: number) => {
    const isUploaded = advStatus === 'id_uploaded';
    const isProcessing = isUploaded || advStatus === 'id_extraction_pending' || idExtractionStatus === 'pending';
    const isExtracted = advStatus === 'id_extracted' || idExtractionStatus === 'extracted';
    const isFailed = advStatus === 'id_extraction_failed' || idExtractionStatus === 'failed';
    const hasSelectedLocalFile = !!idFile;
    const hasRemoteIdDocument = isUploaded || isProcessing || isExtracted || isFailed || idExtractionStatus != null;
    const hasStartedUpload = idUploadStarted || (isProcessing && !isFailed) || isExtracted;
    const canPickIdDocument = !idMutation.isPending && !isProcessing && !isExtracted && (!idUploadStarted || isFailed);
    const canUploadIdDocument = hasSelectedLocalFile && !hasStartedUpload && !isExtracted;
    const displayedExtractionStatus = (idMutation.isPending || isProcessing || (idUploadStarted && !isFailed && !isExtracted))
      ? 'pending'
      : idExtractionStatus;
    const canContinue = isExtracted || isFailed;

    const setSelectedIdFile = (file: FileInfo | null) => {
      if (!file) return;
      setIdFile(file);
      setIdUploadStarted(false);
      if (isFailed) {
        setIdDocumentNumber('');
      }
    };

    const idInfo = effectiveStatus?.extractedIdInfo;

    return (
      <View
        key="step3"
        onLayout={() => { sectionRefs.current[3] = sectionY; }}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>3</Text>
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Identificación oficial</Text>
            <Text style={styles.sectionSubtitle}>Sube una foto de tu identificación oficial vigente</Text>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Tipo de documento</Text>
        <View style={styles.chipsContainer}>
          {[
            { key: 'ine_front', label: 'INE Frente' },
            { key: 'ine_back', label: 'INE Reverso' },
            { key: 'passport', label: 'Pasaporte' },
            { key: 'other', label: 'Otro' },
          ].map((type) => (
            <Chip
              key={type.key}
              label={type.label}
              selected={idDocType === type.key}
              onPress={() => setIdDocType(type.key)}
              disabled={!canPickIdDocument}
            />
          ))}
        </View>

        <View style={styles.fileSection}>
          <Text style={styles.fieldLabel}>Archivo de identificación</Text>
          <TouchableOpacity
            style={styles.filePicker}
            onPress={() => {
              Alert.alert(
                'Seleccionar foto',
                'Elige cómo capturar tu identificación.',
                [
                  {
                    text: 'Cámara',
                    onPress: async () => {
                      const file = await pickFromCamera();
                      setSelectedIdFile(file);
                    },
                  },
                  {
                    text: 'Galería',
                    onPress: async () => {
                      const file = await pickFile('image');
                      setSelectedIdFile(file);
                    },
                  },
                  { text: 'Cancelar', style: 'cancel' },
                ],
              );
            }}
            disabled={!canPickIdDocument}
          >
            {idFile ? (
              <View style={styles.fileInfo}>
                <FileText size={20} color={theme.colors.primary} />
                <Text style={styles.fileName}>{idFile.name}</Text>
              </View>
            ) : hasRemoteIdDocument ? (
              <View style={styles.fileInfo}>
                <FileText size={20} color={theme.colors.primary} />
                <Text style={styles.fileName}>
                  {isExtracted
                    ? 'Identificación verificada'
                    : isFailed
                      ? 'Toca para reemplazar identificación'
                      : 'Identificación subida'}
                </Text>
              </View>
            ) : (
              <View style={styles.filePlaceholder}>
                <Upload size={20} color={theme.colors.textMuted} />
                <Text style={styles.filePlaceholderText}>Toca para seleccionar archivo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {isFailed && (
          <TextInput
            label="Número de identificación (obligatorio por fallo de lectura)"
            value={idDocumentNumber}
            onChangeText={setIdDocumentNumber}
            placeholder="INE, pasaporte, cédula..."
          />
        )}

        {renderExtractionBadge(displayedExtractionStatus)}

        {isExtracted && idInfo && (
          <IdExtractionCard data={idInfo} />
        )}

        {canUploadIdDocument && (
          <PrimaryButton
            label={idMutation.isPending ? 'Subiendo...' : isFailed ? 'Reintentar subida' : 'Subir identificación'}
            onPress={handleUploadId}
            disabled={idMutation.isPending}
            loading={idMutation.isPending}
            style={styles.stepButton}
          />
        )}

        {canContinue && (
          <PrimaryButton
            label="Continuar"
            onPress={() => goToStep(4)}
            icon={<ArrowRight size={18} color={theme.colors.background} />}
            style={styles.stepButton}
          />
        )}
      </View>
    );
  };

  const certInfo = effectiveStatus?.extractedCertificateInfo;
  const idInfo = effectiveStatus?.extractedIdInfo;

  const renderStep4 = (sectionY: number) => (
    <View
      key="step4"
      onLayout={() => { sectionRefs.current[4] = sectionY; }}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>4</Text>
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>Revisión y envío</Text>
          <Text style={styles.sectionSubtitle}>Verifica tu información antes de enviar la solicitud</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de tu solicitud</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Especialidades</Text>
          <Text style={styles.summaryValue}>
            {specialtyKeys.length > 0 ? specialtyKeys.join(', ') : 'No seleccionadas'}
          </Text>
        </View>
        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Experiencia</Text>
          <Text style={styles.summaryValue}>{yearsOfExperience || 'No especificada'} años</Text>
        </View>
        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Biografía</Text>
          <Text style={styles.summaryValue}>{shortBio || 'No especificada'}</Text>
        </View>
        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Certificado</Text>
          <Text style={styles.summaryValue}>
            {certExtractionStatus === 'extracted' && certInfo
              ? certInfo.name
              : certExtractionStatus === 'failed'
                ? 'Error en extracción (revisión manual)'
                : 'No subido'}
          </Text>
        </View>
        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Identificación</Text>
          <Text style={styles.summaryValue}>
            {idExtractionStatus === 'extracted' && idInfo
              ? `${idInfo.fullName} (${idInfo.documentType})`
              : idExtractionStatus === 'failed'
                ? 'Error en extracción (revisión manual)'
                : 'No subida'}
          </Text>
        </View>
      </View>

      {certInfo && (
        <CertificateExtractionCard data={certInfo} />
      )}

      {idInfo && (
        <IdExtractionCard data={idInfo} />
      )}

      {idExtractionStatus === 'failed' && (
        <View style={styles.warningCard}>
          <View style={styles.warningRow}>
            <AlertTriangle size={18} color={theme.colors.warning} />
            <Text style={styles.warningText}>
              No se pudo extraer la información de tu identificación. Tu solicitud se enviará para revisión humana manual.
            </Text>
          </View>
        </View>
      )}

      <PrimaryButton
        label={submitMutation.isPending ? 'Enviando...' : 'Enviar a revisión'}
        onPress={handleSubmit}
        disabled={submitMutation.isPending}
        loading={submitMutation.isPending}
        style={styles.stepButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CompactStepper
        steps={STEP_LABELS}
        currentStep={currentStep}
        onStepPress={(step) => goToStep(step as StepKey)}
        canNavigate={(step) => canNavigate(step as StepKey)}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          onLayout={(e) => { sectionRefs.current[1] = e.nativeEvent.layout.y; }}
        >
          {renderStep1(0)}
        </View>

        <View style={styles.stepSeparator} />

        <View
          onLayout={(e) => { sectionRefs.current[2] = e.nativeEvent.layout.y; }}
        >
          {renderStep2(0)}
        </View>

        <View style={styles.stepSeparator} />

        <View
          onLayout={(e) => { sectionRefs.current[3] = e.nativeEvent.layout.y; }}
        >
          {renderStep3(0)}
        </View>

        <View style={styles.stepSeparator} />

        <View
          onLayout={(e) => { sectionRefs.current[4] = e.nativeEvent.layout.y; }}
        >
          {renderStep4(0)}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
    marginTop: 8,
  },
  sectionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  sectionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  stepSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 28,
  },
  fieldLabel: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  stepButton: {
    marginTop: 24,
  },
  fileSection: {
    marginTop: 8,
  },
  filePicker: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderStyle: 'dashed',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    flex: 1,
  },
  filePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  filePlaceholderText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  badgePending: {
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  badgeError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeTextPending: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  badgeTextSuccess: {
    color: theme.colors.success,
    fontSize: 14,
  },
  badgeTextError: {
    color: theme.colors.error,
    fontSize: 14,
  },
  manualInputHint: {
    color: theme.colors.warning,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  summaryTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    paddingVertical: 8,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  summaryValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  warningCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: theme.colors.warning,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  warningText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
