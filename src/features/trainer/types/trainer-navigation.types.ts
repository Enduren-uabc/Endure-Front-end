import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  WorkoutStackParamList,
  TrainingStackParamList,
  SocialStackParamList,
  TrainerLinkStackParamList,
  ClientsStackParamList,
  SettingsStackParamList,
} from '@/navigation/types';

export type TrainerTabsParamList = {
  Home: undefined;
  Workout: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  Routines: NavigatorScreenParams<TrainingStackParamList> | undefined;
  Clients: NavigatorScreenParams<ClientsStackParamList> | undefined;
  Social: NavigatorScreenParams<SocialStackParamList> | undefined;
  Profile: undefined;
};

export type TrainerDrawerParamList = {
  MainTabs: NavigatorScreenParams<TrainerTabsParamList> | undefined;
  TrainerLinkStack: NavigatorScreenParams<TrainerLinkStackParamList> | undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
  Help: undefined;
  PrivacyNotice: undefined;
};
