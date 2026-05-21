import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  WorkoutStackParamList,
  TrainingStackParamList,
  SocialStackParamList,
  CoachStackParamList,
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
  Settings: undefined;
  Help: undefined;
};
