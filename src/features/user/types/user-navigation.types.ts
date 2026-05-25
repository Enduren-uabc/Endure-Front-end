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
  Routines: NavigatorScreenParams<TrainingStackParamList> | undefined;
  Profile: undefined;
  Social: NavigatorScreenParams<SocialStackParamList> | undefined;
};

export type UserDrawerParamList = {
  MainTabs: NavigatorScreenParams<UserTabsParamList> | undefined;
  CoachStack: NavigatorScreenParams<CoachStackParamList> | undefined;
  TrainerLinkStack: NavigatorScreenParams<TrainerLinkStackParamList> | undefined;
  WorkoutStack: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
  Help: undefined;
  PrivacyNotice: undefined;
};
