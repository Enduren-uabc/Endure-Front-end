import React from 'react';
import {
  NavigationContainer,
  type LinkingOptions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useOnboardingStatus } from '@/features/onboarding/hooks/use-onboarding';
import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import PendingVerificationScreen from '@/features/auth/screens/pending-verification';
import UserDrawer from '@/features/user/navigation/UserDrawer';
import TrainerDrawer from '@/features/trainer/navigation/TrainerDrawer';
import AdminDrawer from '@/features/admin/navigation/AdminDrawer';
import ExerciseCatalogScreen from '@/features/training/screens/exercise-catalog';
import RemindersStack from '@/navigation/RemindersStack';
import { RootStackParamList } from './types';
import { theme } from '@/theme';
import { ROLE_ROUTING_CONFIG, getRoleConfig, AppRole } from './role-routing.config';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'com.endure.app://'],
  config: {
    screens: {
      AuthStack: {
        screens: {
          Welcome: '',
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password',
          SessionExpired: 'session-expired',
          OAuthError: 'oauth-error',
        },
      },
      OnboardingStack: {
        screens: {
          Goal: 'onboarding',
          BasicData: 'onboarding/basic-data',
          Level: 'onboarding/level',
          Summary: 'onboarding/summary',
        },
      },
      UserApp: {
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Routines: {
                screens: {
                  RoutinesList: 'routines',
                  RoutineDetail: 'routine-detail/:id',
                  RoutineBuilder: 'routine-builder/:id',
                  ExerciseCatalog: 'routine-builder/:routineId/exercises',
                  ExerciseDetail: 'routine/:routineId/exercise-detail',
                },
              },
              Profile: 'profile',
              Social: {
                screens: {
                  SocialFeed: 'social',

                  PublicProfile: 'social/profile/:userId',
                  PostDetail: 'social/post/:postId',
                },
              },
            },
          },
          WorkoutStack: {
            screens: {
              WorkoutStart: 'workout',
              WorkoutSession: 'workout/session/:sessionId',
              WorkoutFinishSummary: 'workout/summary/:sessionId',
              WorkoutHistory: 'workout/history',
              WorkoutSessionDetail: 'workout/history/:sessionId',
              ExerciseProgress: 'workout/progress',
              Achievements: 'workout/achievements',
              Measurements: 'workout/measurements',
            },
          },
          Settings: {
            screens: {
              SettingsHome: 'settings',
              Reminders: 'settings/reminders',
              PrivacyNotice: 'settings/privacy',
            },
          },
          Help: 'help',
        },
      },
      TrainerApp: {
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Clients: {
                screens: {
                  ClientsList: 'trainer/clients',
                  ClientDetail: 'trainer/clients/:clientId',
                  AssignRoutine: 'trainer/clients/:clientId/assign-routine',
                  ClientProgress: 'trainer/clients/:clientId/progress',
                },
              },
              Routines: 'trainer/routines',
              Profile: 'trainer/profile',
            },
          },
          WorkoutStack: {
            screens: {
              WorkoutStart: 'workout',
              WorkoutSession: 'workout/session/:sessionId',
              WorkoutFinishSummary: 'workout/summary/:sessionId',
              WorkoutHistory: 'workout/history',
              WorkoutSessionDetail: 'workout/history/:sessionId',
              ExerciseProgress: 'workout/progress',
              Achievements: 'workout/achievements',
              Measurements: 'workout/measurements',
            },
          },
          TrainingStack: {
            screens: {
              RoutinesList: 'trainer/routines/list',
              RoutineDetail: 'trainer/routine-detail/:id',
              RoutineBuilder: 'trainer/routine-builder/:id',
              ExerciseCatalog: 'trainer/routine-builder/:routineId/exercises',
              ExerciseDetail: 'trainer/routine/:routineId/exercise-detail',
            },
          },
          Settings: {
            screens: {
              SettingsHome: 'settings',
              Reminders: 'settings/reminders',
              PrivacyNotice: 'settings/privacy',
            },
          },
          Help: 'help',
        },
      },
      AdminApp: {
        screens: {
          MainTabs: {
            screens: {
              Verifications: {
                screens: {
                  PendingVerifications: 'admin/verifications',
                  VerificationDetail: 'admin/verifications/:verificationId',
                },
              },
            },
          },
          Settings: 'settings',
          Help: 'help',
        },
      },
      ExerciseCatalogModal: 'exercise-catalog',
    },
  },
};

export default function RootNavigator() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const emailVerified = useSessionStore((s) => s.emailVerified);
  const role = useSessionStore((s) => s.role) as AppRole | null;
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const onboardingCompleted = useSessionStore((s) => s.onboardingCompleted);
  const setOnboardingCompleted = useSessionStore((s) => s.setOnboardingCompleted);
  const shouldCheckOnboarding = hasHydrated && isAuthenticated;
  const onboardingStatus = useOnboardingStatus(shouldCheckOnboarding);

  const resolvedOnboardingCompleted =
    onboardingStatus.data?.completed ?? onboardingCompleted;
  const isResolvingOnboarding =
    shouldCheckOnboarding &&
    onboardingStatus.isPending &&
    resolvedOnboardingCompleted !== true;

  const targetRoute = React.useMemo<keyof RootStackParamList | null>(() => {
    if (!hasHydrated) return null;
    if (!isAuthenticated) return 'AuthStack';
    if (!emailVerified) return 'PendingVerification';

    const roleConfig = getRoleConfig(role);
    if (!roleConfig) {
      return 'AuthStack';
    }

    if (!roleConfig.requiresOnboarding) {
      return roleConfig.rootAppRoute;
    }

    if (isResolvingOnboarding) return null;
    if (resolvedOnboardingCompleted !== true) return 'OnboardingStack';
    return roleConfig.rootAppRoute;
  }, [hasHydrated, isAuthenticated, emailVerified, isResolvingOnboarding, resolvedOnboardingCompleted, role]);

  const previousRouteRef = React.useRef<keyof RootStackParamList | null>(null);

  const resetToTargetRoute = React.useCallback((routeName: keyof RootStackParamList) => {
    if (!navigationRef.isReady()) return;

    const rootState = navigationRef.getRootState();
    const currentRootRoute = rootState?.routes[rootState.index]?.name;

    if (currentRootRoute !== routeName) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    }

    previousRouteRef.current = routeName;
  }, []);

  React.useEffect(() => {
    if (onboardingStatus.data) {
      setOnboardingCompleted(onboardingStatus.data.completed);
    }
  }, [onboardingStatus.data, setOnboardingCompleted]);

  React.useEffect(() => {
    if (!targetRoute) return;

    resetToTargetRoute(targetRoute);
  }, [resetToTargetRoute, targetRoute]);

  if (!targetRoute) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => {
        if (targetRoute) resetToTargetRoute(targetRoute);
      }}
    >
      <Stack.Navigator
        initialRouteName={targetRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen
          name="PendingVerification"
          component={PendingVerificationScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
        <Stack.Screen name="UserApp" component={UserDrawer} />
        <Stack.Screen name="TrainerApp" component={TrainerDrawer} />
        <Stack.Screen name="AdminApp" component={AdminDrawer} />
        <Stack.Screen
          name="ExerciseCatalogModal"
          component={ExerciseCatalogScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="RemindersStack"
          component={RemindersStack}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
