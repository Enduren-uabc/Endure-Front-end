export interface TrainingStrategyRules {
  type?: 'linear' | 'percentage' | 'wave';
  weightStep?: number | null;
  repStep?: number | null;
  weightPercentage?: number | null;
  wavePercentages?: number[] | null;
}

export interface TrainingStrategy {
  key: string;
  name: string;
  description: string;
  rules: TrainingStrategyRules;
}
