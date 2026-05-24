import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ExerciseConfig } from '@/features/training/types/routine';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { email?: string; password?: string } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPasswordCode: { email: string };
  ResetPassword: { email: string; token: string };
  SessionExpired: undefined;
  OAuthError: {
    provider: 'google' | 'apple';
    reason: 'cancelled' | 'failed';
    message?: string;
  };
  Privacy: { from?: string } | undefined;
};

export type OnboardingStackParamList = {
  Goal: undefined;
  BasicData: undefined;
  Level: undefined;
  Summary: undefined;
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
  ExerciseCatalog: { routineId?: string } | undefined;
  ExerciseDetail: { routineId: string; exercise: ExerciseConfig };
};

export type CoachStackParamList = {
  CoachHome: undefined;
  CoachForm: { isResubmit?: boolean } | undefined;
  CoachStatus: undefined;
  CoachRejected: undefined;
  PowerspikeHome: undefined;
  PowerspikeForm: undefined;
  PowerspikeStatus: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Reminders: undefined;
  PrivacyNotice: undefined;
};

export type AdminStackParamList = {
  PendingVerifications: undefined;
  VerificationDetail: { verificationId: string };
};

export type RemindersStackParamList = {
  ReminderList: undefined;
  ReminderCreate: undefined;
  ReminderEdit: { reminderId: string };
  NotificationList: undefined;
};

export type ClientsStackParamList = {
  ClientList: undefined;
  ClientDetail: { clientId: string; clientName: string };
  ExerciseProgress: { clientId: string; exerciseId: string; exerciseName: string };
  AssignRoutine: { clientId: string; clientName: string };
  AssignedRoutineDetail: { clientId: string; assignedId: string; routineName: string };
  EditAssignedRoutine: { clientId: string; clientName: string; assignedId: string; routineName: string };
};

export type TrainerLinkStackParamList = {
  SearchTrainer: undefined;
  TrainerProfile: { trainerId: string };
  SentRequests: undefined;
  MyTrainer: undefined;
  ReceivedRequests: undefined;
  AssignedRoutine: undefined;
  MyAssignedRoutines: undefined;
};


export type TrainerClientsStackParamList = {
  ClientsList: undefined;
  ClientDetail: {
    clientId: string;
    clientName: string;
    linkId: string;
    activatedAt: string;
  };
  AssignRoutine: {
    clientId: string;
    clientName: string;
    linkId: string;
    activatedAt: string;
  };
  ClientProgress: {
    clientId: string;
    clientName: string;
    linkId: string;
    activatedAt: string;
  };
};
};

export type AppTabsParamList = {
  Home: undefined;
  Workout: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  Routines: NavigatorScreenParams<TrainingStackParamList> | undefined;
  Social: NavigatorScreenParams<SocialStackParamList> | undefined;
};

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList> | undefined;
  OnboardingStack: NavigatorScreenParams<OnboardingStackParamList> | undefined;
  UserApp: undefined;
  TrainerApp: undefined;
  AdminApp: undefined;
  ExerciseCatalogModal: undefined;
  RemindersStack: NavigatorScreenParams<RemindersStackParamList> | undefined;
  PendingVerification: { email: string };
};
