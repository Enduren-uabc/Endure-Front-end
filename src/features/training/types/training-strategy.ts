export interface TrainingStrategy {
  key: string;
  name: string;
  description: string;
  rules: Record<string, unknown>;
}
