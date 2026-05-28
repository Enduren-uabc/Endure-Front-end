import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sprout, Flame, Trophy, Info } from 'lucide-react-native';
import type { OnboardingStackParamList } from '@/navigation/types';
import {
  onboardingLevelSchema,
  type OnboardingLevelFormData,
} from '@/features/onboarding/validations/onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { OnboardingStepIndicator } from '@/features/onboarding/components/OnboardingStepIndicator';
import { useFlowConfig } from '@/features/trainer-verification/hooks/use-trainer-verification';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Chip } from '@/components/ui/Chip';
import { theme } from '@/theme';

interface LevelOption {
  value: 'beginner' | 'intermediate' | 'advanced';
  label: string;
  description: string;
  Icon: typeof Sprout;
}

const LEVELS: LevelOption[] = [
  {
    value: 'beginner',
    label: 'Principiante',
    description: 'Llevo menos de 6 meses entrenando',
    Icon: Sprout,
  },
  {
    value: 'intermediate',
    label: 'Intermedio',
    description: 'Entreno regularmente hace más de 6 meses',
    Icon: Flame,
  },
  {
    value: 'advanced',
    label: 'Avanzado',
    description: 'Entreno con alta intensidad hace años',
    Icon: Trophy,
  },
];

interface StrategyInfo {
  key: string;
  name: string;
  description: string;
}

const ALL_STRATEGIES: StrategyInfo[] = [
  { key: 'straight', name: 'Straight (Estática)', description: 'Peso y reps constantes en todos los sets' },
  { key: 'ascending', name: 'Ascending / UPP', description: 'Sube peso, bajan reps en cada set' },
  { key: 'drop_sets', name: 'Drop Sets', description: 'Baja peso rápido sin descanso, mismas reps' },
  { key: 'wave_loading', name: 'Wave Loading', description: 'Alterna pesos en olas sobre peso base' },
  { key: 'descending', name: 'Descending / Down', description: 'Empieza peso máximo, baja peso, suben reps' },
];

const RECOMMENDED_KEYS = ['ascending', 'drop_sets', 'wave_loading'];

const BEGINNER_STRATEGY: StrategyInfo = {
  key: 'straight',
  name: 'Straight (Estática)',
  description: 'Peso y reps constantes en todos los sets. Perfecto para empezar.',
};

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Level'>;

export default function OnboardingLevelScreen({ navigation }: Props) {
  const draft = useOnboardingStore();
  const { data: flowConfig } = useFlowConfig();
  const showSocial = flowConfig?.powerspike === true;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OnboardingLevelFormData>({
    resolver: zodResolver(onboardingLevelSchema),
    defaultValues: {
      experienceLevel: draft.experienceLevel ?? undefined,
    },
  });

  const selectedLevel = watch('experienceLevel');
  const [selectedStrategy, setSelectedStrategy] = React.useState<string | null>(
    draft.trainingStrategyKey ?? null,
  );
  const [selectedSplit, setSelectedSplit] = React.useState<'ppl' | 'arnold' | null>(
    draft.trainingSplitKey ?? 'ppl',
  );

  const recommended = ALL_STRATEGIES.filter((s) => RECOMMENDED_KEYS.includes(s.key));
  const other = ALL_STRATEGIES.filter((s) => !RECOMMENDED_KEYS.includes(s.key));

  const onSubmit = (data: OnboardingLevelFormData) => {
    draft.setExperienceLevel(data.experienceLevel);
    if (data.experienceLevel === 'beginner') {
      draft.setTrainingStrategyKey('straight');
    } else if (selectedStrategy) {
      draft.setTrainingStrategyKey(selectedStrategy);
    }
    if (data.experienceLevel === 'advanced' && selectedSplit) {
      draft.setTrainingSplitKey(selectedSplit);
    }
    if (showSocial) {
      navigation.navigate('SocialSetup');
    } else {
      navigation.navigate('Summary');
    }
  };

  const handleLevelChange = (level: string, onChange: (v: string) => void) => {
    onChange(level);
    if (level === 'beginner') {
      setSelectedStrategy('straight');
    } else {
      setSelectedStrategy(draft.trainingStrategyKey ?? null);
    }
    if (level === 'advanced') {
      setSelectedSplit(draft.trainingSplitKey ?? 'ppl');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <OnboardingStepIndicator currentStep={3} showSocial={showSocial} />
          <Text style={styles.title}>¿Cuál es tu nivel?</Text>
          <Text style={styles.subtitle}>
            Ajustaremos la dificultad de las rutinas sugeridas.
          </Text>
        </View>

        <Controller
          control={control}
          name="experienceLevel"
          render={({ field: { onChange, value } }) => (
            <View style={styles.cardsContainer}>
              {LEVELS.map((level) => {
                const isSelected = value === level.value;
                return (
                  <React.Fragment key={level.value}>
                    <TouchableOpacity
                      style={[styles.card, isSelected && styles.cardSelected]}
                      onPress={() => handleLevelChange(level.value, onChange)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={level.label}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={styles.cardIcon}>
                        <level.Icon
                          size={24}
                          color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                          strokeWidth={1.5}
                        />
                      </View>
                      <View style={styles.cardText}>
                        <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                          {level.label}
                        </Text>
                        <Text style={styles.cardDescription}>{level.description}</Text>
                      </View>
                    </TouchableOpacity>

                    {isSelected && level.value === 'beginner' && (
                      <View style={styles.strategySection}>
                        <View style={styles.strategyInfoCard}>
                          <Info size={18} color={theme.colors.primary} />
                          <View style={styles.strategyInfoText}>
                            <Text style={styles.strategyAssignedLabel}>Estrategia asignada</Text>
                            <Text style={styles.strategyAssignedName}>{BEGINNER_STRATEGY.name}</Text>
                            <Text style={styles.strategyAssignedDesc}>{BEGINNER_STRATEGY.description}</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {isSelected && level.value === 'intermediate' && (
                      <View style={styles.strategySection}>
                        <Text style={styles.strategySectionLabel}>Elige tu estrategia de entrenamiento</Text>

                        <Text style={styles.strategySubLabel}>⭐ RECOMENDADAS</Text>
                        <View style={styles.strategyChipsRow}>
                          {recommended.map((s) => (
                            <Chip
                              key={s.key}
                              label={s.name}
                              selected={selectedStrategy === s.key}
                              onPress={() => setSelectedStrategy(s.key)}
                            />
                          ))}
                        </View>

                        <View style={styles.strategyDivider} />

                        <Text style={styles.strategySubLabel}>TODAS</Text>
                        <View style={styles.strategyChipsRow}>
                          {other.map((s) => (
                            <Chip
                              key={s.key}
                              label={s.name}
                              selected={selectedStrategy === s.key}
                              onPress={() => setSelectedStrategy(s.key)}
                            />
                          ))}
                        </View>
                      </View>
                    )}

                    {isSelected && level.value === 'advanced' && (
                      <>
                        <View style={styles.strategySection}>
                          <Text style={styles.strategySectionLabel}>Elige tu estrategia de entrenamiento</Text>
                          <View style={styles.strategyChipsRow}>
                            {ALL_STRATEGIES.map((s) => (
                              <Chip
                                key={s.key}
                                label={s.name}
                                selected={selectedStrategy === s.key}
                                onPress={() => setSelectedStrategy(s.key)}
                              />
                            ))}
                          </View>
                        </View>

                        <View style={styles.strategySection}>
                          <Text style={styles.strategySectionLabel}>Elige tu tipo de rutina</Text>
                          <View style={styles.strategyChipsRow}>
                            <Chip
                              label="Push / Pull / Legs"
                              selected={selectedSplit === 'ppl'}
                              onPress={() => setSelectedSplit('ppl')}
                            />
                            <Chip
                              label="Arnold Split"
                              selected={selectedSplit === 'arnold'}
                              onPress={() => setSelectedSplit('arnold')}
                            />
                          </View>
                        </View>
                      </>
                    )}
                  </React.Fragment>
                );
              })}
              {errors.experienceLevel ? (
                <Text style={styles.errorText}>{errors.experienceLevel.message}</Text>
              ) : null}
            </View>
          )}
        />

        <View style={styles.footer}>
          <PrimaryButton label="Continuar" onPress={handleSubmit(onSubmit)} />
          <SecondaryButton label="Volver" onPress={() => navigation.navigate('BasicData')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
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

  /* Cards */
  cardsContainer: {
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  cardTitleSelected: {
    color: theme.colors.primary,
  },
  cardDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },

  /* Strategy section (expanded below card) */
  strategySection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    marginTop: -theme.spacing.sm,
  },
  strategyInfoCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  strategyInfoText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  strategyAssignedLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  strategyAssignedName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  strategyAssignedDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  strategySectionLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  strategySubLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  strategyChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  strategyDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },

  /* Error */
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'center',
  },

  /* Footer */
  footer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
});
