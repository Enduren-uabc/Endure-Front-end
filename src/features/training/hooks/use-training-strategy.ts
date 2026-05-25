import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { TrainingStrategy, TrainingStrategyRules } from '../types/training-strategy';

interface ListTrainingStrategiesResponse {
  strategies: TrainingStrategy[];
}

export interface CalculatedSet {
  setNumber: number;
  weight: number;
  reps: number;
}

/**
 * Pure function: calcula el peso para un set específico (0-indexed).
 */
export function calculateWeight(
  rules: TrainingStrategyRules | null,
  initialWeight: number,
  setIndex: number,
  previousWeight: number,
): number {
  if (!rules || !rules.type) return initialWeight;

  switch (rules.type) {
    case 'linear': {
      const step = rules.weightStep ?? 0;
      return parseFloat((initialWeight + setIndex * step).toFixed(1));
    }
    case 'percentage': {
      const pct = rules.weightPercentage ?? 1;
      return parseFloat((previousWeight * pct).toFixed(1));
    }
    case 'wave': {
      const percentages = rules.wavePercentages ?? [0];
      const wavePct = percentages[setIndex % percentages.length] ?? 0;
      return parseFloat((initialWeight * (1 + wavePct)).toFixed(1));
    }
    default:
      return initialWeight;
  }
}

/**
 * Pure function: calcula las repeticiones para un set específico (0-indexed).
 */
export function calculateReps(
  rules: TrainingStrategyRules | null,
  initialReps: number,
  setIndex: number,
): number {
  if (!rules || !rules.type) return initialReps;

  switch (rules.type) {
    case 'linear': {
      const step = rules.repStep ?? 0;
      return Math.max(1, initialReps + setIndex * step);
    }
    case 'percentage':
    case 'wave':
    default:
      return initialReps;
  }
}

/**
 * Pure function: genera todos los sets iniciales para un ejercicio nuevo.
 */
export function getInitialSets(
  rules: TrainingStrategyRules | null,
  numberOfSets: number,
  initialWeight: number,
  initialReps: number,
): CalculatedSet[] {
  const sets: CalculatedSet[] = [];
  let previousWeight = initialWeight;

  for (let i = 0; i < numberOfSets; i++) {
    const weight = calculateWeight(rules, initialWeight, i, previousWeight);
    const reps = calculateReps(rules, initialReps, i);
    sets.push({ setNumber: i + 1, weight, reps });
    previousWeight = weight;
  }

  return sets;
}

/**
 * Pure function: calcula el siguiente set basado en el último set real.
 */
export function calculateNextSet(
  rules: TrainingStrategyRules | null,
  currentSets: CalculatedSet[],
  initialWeight: number,
  initialReps: number,
): CalculatedSet {
  const lastSet = currentSets[currentSets.length - 1];
  const nextIndex = currentSets.length;
  const weight = calculateWeight(rules, initialWeight, nextIndex, lastSet?.weight ?? initialWeight);
  const reps = calculateReps(rules, initialReps, nextIndex);
  return { setNumber: nextIndex + 1, weight, reps };
}

/**
 * Pure function: calcula un set específico (0-indexed) para preview.
 */
export function calculateSet(
  rules: TrainingStrategyRules | null,
  setIndex: number,
  initialWeight: number,
  initialReps: number,
): CalculatedSet {
  const previousWeight = setIndex > 0
    ? calculateWeight(rules, initialWeight, setIndex - 1, initialWeight)
    : initialWeight;
  const weight = calculateWeight(rules, initialWeight, setIndex, previousWeight);
  const reps = calculateReps(rules, initialReps, setIndex);
  return { setNumber: setIndex + 1, weight, reps };
}

/**
 * Hook que encapsula la lógica de negocio para calcular
 * series según la estrategia de entrenamiento seleccionada.
 */
export function useTrainingStrategy(strategyKey: string | null) {
  const { data: strategies } = useQuery<TrainingStrategy[]>({
    queryKey: ['training-strategies'],
    queryFn: async () => {
      const data = await apiClient.get<ListTrainingStrategiesResponse>(
        API_ENDPOINTS.trainingStrategies.list,
      );
      return data.strategies ?? [];
    },
    staleTime: Infinity,
  });

  const strategy = strategies?.find((s) => s.key === strategyKey) ?? null;
  const rules = strategy?.rules ?? null;

  return {
    strategy,
    rules,
    getInitialSets: (numberOfSets: number, initialWeight: number, initialReps: number) =>
      getInitialSets(rules, numberOfSets, initialWeight, initialReps),
    calculateNextSet: (currentSets: CalculatedSet[], initialWeight: number, initialReps: number) =>
      calculateNextSet(rules, currentSets, initialWeight, initialReps),
    calculateSet: (setIndex: number, initialWeight: number, initialReps: number) =>
      calculateSet(rules, setIndex, initialWeight, initialReps),
  };
}
