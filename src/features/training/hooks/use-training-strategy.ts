import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { TrainingStrategy } from '../types/training-strategy';

interface ListTrainingStrategiesResponse {
  strategies: TrainingStrategy[];
}

interface CalculatedSet {
  setNumber: number;
  weight: number;
  reps: number;
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
  const rules = strategy?.rules;

  /**
   * Calcula el peso para un set específico (0-indexed).
   */
  function calculateWeight(
    initialWeight: number,
    setIndex: number,
    previousWeight: number,
  ): number {
    if (!rules) return initialWeight;

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
   * Calcula las repeticiones para un set específico (0-indexed).
   */
  function calculateReps(initialReps: number, setIndex: number): number {
    if (!rules) return initialReps;

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
   * Genera todos los sets iniciales para un ejercicio nuevo.
   * Útil al agregar un ejercicio a una rutina.
   */
  function getInitialSets(
    numberOfSets: number,
    initialWeight: number,
    initialReps: number,
  ): CalculatedSet[] {
    const sets: CalculatedSet[] = [];
    let previousWeight = initialWeight;

    for (let i = 0; i < numberOfSets; i++) {
      const weight = calculateWeight(initialWeight, i, previousWeight);
      const reps = calculateReps(initialReps, i);
      sets.push({ setNumber: i + 1, weight, reps });
      previousWeight = weight;
    }

    return sets;
  }

  /**
   * Calcula el siguiente set basado en el último set real.
   * Útil al agregar un set adicional a un ejercicio existente.
   */
  function calculateNextSet(
    currentSets: CalculatedSet[],
    initialWeight: number,
    initialReps: number,
  ): CalculatedSet {
    const lastSet = currentSets[currentSets.length - 1];
    const nextIndex = currentSets.length;
    const weight = calculateWeight(initialWeight, nextIndex, lastSet?.weight ?? initialWeight);
    const reps = calculateReps(initialReps, nextIndex);
    return { setNumber: nextIndex + 1, weight, reps };
  }

  /**
   * Calcula un set específico (0-indexed) para preview.
   */
  function calculateSet(
    setIndex: number,
    initialWeight: number,
    initialReps: number,
  ): CalculatedSet {
    const previousWeight = setIndex > 0
      ? calculateWeight(initialWeight, setIndex - 1, initialWeight)
      : initialWeight;
    const weight = calculateWeight(initialWeight, setIndex, previousWeight);
    const reps = calculateReps(initialReps, setIndex);
    return { setNumber: setIndex + 1, weight, reps };
  }

  return {
    strategy,
    getInitialSets,
    calculateNextSet,
    calculateSet,
  };
}
