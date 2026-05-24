import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  WorkoutStackParamList,
  TrainingStackParamList,
  TrainerLinkStackParamList,
  TrainerClientsStackParamList,
  SettingsStackParamList,
} from '@/navigation/types';

export type TrainerTabsParamList = {
  Home: undefined;
  Clients: NavigatorScreenParams<TrainerClientsStackParamList> | undefined;
  Routines: undefined;
  Profile: undefined;
};

export type TrainerDrawerParamList = {
  MainTabs: NavigatorScreenParams<TrainerTabsParamList> | undefined;
  TrainerLinkStack: NavigatorScreenParams<TrainerLinkStackParamList> | undefined;
  WorkoutStack: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  TrainingStack: NavigatorScreenParams<TrainingStackParamList> | undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
  Help: undefined;
};
