import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ExerciseConfig } from '@/features/training/types/routine';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};

export type OnboardingStackParamList = {
  Goal: undefined;
  BasicData: undefined;
  Level: undefined;
  Summary: undefined;
};

export type AppTabsParamList = {
  Home: undefined;
  Workout: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  Routines: NavigatorScreenParams<TrainingStackParamList> | undefined;
  Social: NavigatorScreenParams<SocialStackParamList> | undefined;
};

export type WorkoutStackParamList = {
  WorkoutStart: undefined;
  WorkoutSession: { sessionId: string };
  WorkoutFinishSummary: { sessionId: string };
  WorkoutHistory: undefined;
};

export type SocialStackParamList = {
  SocialFeed: undefined;
  PublicProfile: { userId: string };
  PostDetail: { postId: string; title?: string; content?: string; authorUserId?: string };
};

export type TrainingStackParamList = {
  RoutinesList: undefined;
  RoutineDetail: { id: string };
  RoutineBuilder: { id: string };
  ExerciseDetail: { routineId: string; exercise: ExerciseConfig };
};

export type CoachStackParamList = {
  CoachHome: undefined;
  CoachForm: { isResubmit?: boolean } | undefined;
  CoachStatus: undefined;
  CoachRejected: undefined;
};

export type AppDrawerParamList = {
  MainTabs: NavigatorScreenParams<AppTabsParamList> | undefined;
  Settings: undefined;
  Help: undefined;
  CoachStack: NavigatorScreenParams<CoachStackParamList> | undefined;
};

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList> | undefined;
  OnboardingStack: NavigatorScreenParams<OnboardingStackParamList> | undefined;
  AppDrawer: NavigatorScreenParams<AppDrawerParamList> | undefined;
  ExerciseCatalogModal: undefined;
};
