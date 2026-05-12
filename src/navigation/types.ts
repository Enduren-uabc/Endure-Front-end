export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string } | undefined;
};

export type OnboardingStackParamList = {
  Goal: undefined;
  BasicData: undefined;
  Level: undefined;
  Summary: undefined;
};

export type AppTabsParamList = {
  Home: undefined;
  Routines: undefined;
};

export type TrainingStackParamList = {
  RoutinesList: undefined;
  RoutineDetail: { id: string };
  CreateRoutine: undefined;
  RoutineBuilder: { id: string };
  ExerciseCatalog: { onSelect: (name: string) => void };
};

export type RootStackParamList = {
  AuthStack: undefined;
  OnboardingStack: undefined;
  AppDrawer: undefined;
};
