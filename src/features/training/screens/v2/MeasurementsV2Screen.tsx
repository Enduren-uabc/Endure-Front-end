import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus, Ruler, Scale, X } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { DragIndicator } from '@/components/ui/DragIndicator';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
} from './TrainingV2Primitives';
import {
  TrainingV2EmptyState,
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from './TrainingV2States';
import type { TrainingV2State } from './training-v2.types';
import type { WorkoutStackParamList } from '@/navigation/types';
import type { UserDrawerParamList } from '@/features/user/types/user-navigation.types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'Measurements'>;

interface BodyMeasurement {
  id: string;
  label: string;
  value: string;
  helper: string;
  progress: number;
}

const initialMeasurements: BodyMeasurement[] = [
  { id: 'weight', label: 'Peso', value: '78.4 kg', helper: 'Ultimo registro', progress: 0.66 },
  { id: 'waist', label: 'Cintura', value: '82 cm', helper: 'Hace 6 dias', progress: 0.58 },
  { id: 'body-fat', label: 'Grasa corporal', value: '18%', helper: 'Estimado local', progress: 0.48 },
];

export default function MeasurementsV2Screen({ navigation, route }: Props) {
  const visualState: TrainingV2State = 'success';
  const [measurements, setMeasurements] = React.useState(initialMeasurements);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [weight, setWeight] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [mutationError, setMutationError] = React.useState<string | null>(null);
  const returnTo = route.params?.returnTo;

  const handleBack = React.useCallback(() => {
    const drawerNavigation = navigation.getParent<NavigationProp<UserDrawerParamList>>();

    if (returnTo === 'Profile' && drawerNavigation) {
      drawerNavigation.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation.goBack();
  }, [navigation, returnTo]);

  const saveMeasurement = () => {
    const numericWeight = Number(weight.replace(',', '.'));
    if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
      setMutationError('Ingresa un peso valido mayor a cero.');
      return;
    }

    setIsSaving(true);
    setMutationError(null);
    setTimeout(() => {
      setMeasurements((current) => [
        {
          id: `weight-${Date.now()}`,
          label: 'Peso',
          value: `${numericWeight.toFixed(1)} kg`,
          helper: 'Agregado localmente',
          progress: Math.min(0.95, Math.max(0.35, numericWeight / 120)),
        },
        ...current.filter((item) => item.id !== 'weight'),
      ]);
      setIsSaving(false);
      setSheetOpen(false);
      setWeight('');
    }, 450);
  };

  function renderContent() {
    if (visualState === 'loading') return <TrainingV2SkeletonList rows={3} />;

    if (visualState === 'error') {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tus mediciones"
          description="Intenta de nuevo para revisar peso y datos corporales."
          onAction={() => undefined}
        />
      );
    }

    if (measurements.length === 0) {
      return (
        <TrainingV2EmptyState
          title="Aun no tienes mediciones"
          description="Registra tu primer dato corporal para comparar avances."
          actionLabel="Agregar medicion"
          onAction={() => setSheetOpen(true)}
        />
      );
    }

    return (
      <>
        <BaseCard style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Scale size={28} color={theme.colors.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Datos corporales</Text>
            <Text style={styles.heroText}>
              Seguimiento visual de peso y mediciones. Por ahora se guarda localmente.
            </Text>
          </View>
        </BaseCard>

        <TrainingV2SectionHeader title="Ultimos registros" actionLabel="Agregar" onAction={() => setSheetOpen(true)} />
        <View style={styles.list}>
          {measurements.map((measurement) => (
            <BaseCard key={measurement.id} style={styles.measurementCard}>
              <View style={styles.measurementHeader}>
                <View style={styles.measurementIcon}>
                  <Ruler size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.measurementCopy}>
                  <Text style={styles.measurementLabel}>{measurement.label}</Text>
                  <Text style={styles.measurementValue}>{measurement.value}</Text>
                  <Text style={styles.measurementHelper}>{measurement.helper}</Text>
                </View>
              </View>
              <TrainingV2ProgressBar progress={measurement.progress} />
            </BaseCard>
          ))}
        </View>
      </>
    );
  }

  return (
    <>
      <TrainingV2Screen
        title="Mediciones"
        titleColor={theme.colors.textPrimary}
        subtitle="Peso, cintura y datos corporales."
        onBack={handleBack}
      >
        {renderContent()}
      </TrainingV2Screen>

      <Modal visible={sheetOpen} animationType="slide" transparent>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <DragIndicator position="inside" />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Agregar medicion</Text>
              <Pressable onPress={() => setSheetOpen(false)} disabled={isSaving} style={styles.closeButton}>
                <X size={22} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Peso actual (kg)</Text>
              <TextInput
                value={weight}
                onChangeText={(value) => {
                  setWeight(value);
                  setMutationError(null);
                }}
                editable={!isSaving}
                keyboardType="decimal-pad"
                placeholder="78.4"
                placeholderTextColor={theme.colors.textMuted}
                selectionColor={theme.colors.primary}
                style={styles.input}
              />
            </View>
            {mutationError ? <Text style={styles.formError}>{mutationError}</Text> : null}
            <PrimaryButton
              label={isSaving ? 'Guardando' : 'Guardar medicion'}
              onPress={saveMeasurement}
              loading={isSaving}
              disabled={isSaving}
              icon={!isSaving ? <Plus size={18} color={theme.colors.background} /> : undefined}
            />
            <SecondaryButton label="Cancelar" onPress={() => setSheetOpen(false)} disabled={isSaving} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  heroText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  list: {
    gap: theme.spacing.md,
  },
  measurementCard: {
    gap: theme.spacing.md,
  },
  measurementHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  measurementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  measurementCopy: {
    flex: 1,
    gap: 2,
  },
  measurementLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  measurementValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  measurementHelper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  formError: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});
