export interface HomeProfileData {
  id: string;
  fullName: string;
  birthDate: string;
  gender: string;
  weight: number;
  height: number;
  experienceLevel: string;
  mainGoal: string;
  weightUnit: string;
}

export interface WeeklyStats {
  completedWorkouts: number;
  totalVolumeKg: number;
  activeMinutes: number;
}

export interface StreakData {
  days: boolean[];
  currentStreak: number;
}

export interface HomeData {
  profile: HomeProfileData | null;
  weeklyStats: WeeklyStats | null;
  streak: StreakData | null;
  hasActiveRoutine: boolean;
}
