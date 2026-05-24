import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AdminStackParamList } from '@/navigation/types';

export type AdminTabsParamList = {
  Dashboard: undefined;
  Verifications: NavigatorScreenParams<AdminStackParamList> | undefined;
};

export type AdminDrawerParamList = {
  MainTabs: NavigatorScreenParams<AdminTabsParamList> | undefined;
  Settings: undefined;
  Help: undefined;
  PrivacyNotice: undefined;
};
