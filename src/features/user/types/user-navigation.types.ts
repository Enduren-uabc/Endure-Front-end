import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  WorkoutStackParamList,
  TrainingStackParamList,
  SocialStackParamList,
  CoachStackParamList,
  TrainerLinkStackParamList,
  SettingsStackParamList,
} from '@/navigation/types';

export type UserTabsParamList = {
  Home: undefined;
  Workout: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  Routines: NavigatorScreenParams<TrainingStackParamList> | undefined;
  Social: NavigatorScreenParams<SocialStackParamList> | undefined;
};

export type UserDrawerParamList = {
  MainTabs: NavigatorScreenParams<UserTabsParamList> | undefined;
  CoachStack: NavigatorScreenParams<CoachStackParamList> | undefined;
  TrainerLinkStack: NavigatorScreenParams<TrainerLinkStackParamList> | undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
  Help: undefined;
  PrivacyNotice: undefined;
};
