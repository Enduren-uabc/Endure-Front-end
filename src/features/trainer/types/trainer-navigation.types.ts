import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  WorkoutStackParamList,
  TrainingStackParamList,
  SocialStackParamList,
  TrainerLinkStackParamList,
  TrainerClientsStackParamList,
  SettingsStackParamList,
} from '@/navigation/types';

export type TrainerTabsParamList = {
  Home: undefined;
  Workout: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  Routines: NavigatorScreenParams<TrainingStackParamList> | undefined;
  Clients: NavigatorScreenParams<TrainerClientsStackParamList> | undefined;
  Social: NavigatorScreenParams<SocialStackParamList> | undefined;
};

export type TrainerDrawerParamList = {
  MainTabs: NavigatorScreenParams<TrainerTabsParamList> | undefined;
  TrainerLinkStack: NavigatorScreenParams<TrainerLinkStackParamList> | undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
  Help: undefined;
};
