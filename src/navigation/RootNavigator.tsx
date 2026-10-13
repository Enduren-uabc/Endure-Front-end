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
import { RootStackParamList } from './types';
import { theme } from '@/theme';
import { Platform } from 'react-native';
import { api } from '@/lib/api-client';
import { tokenStore } from '@/lib/secure-token-store';
import type { MeResponse } from '@/features/auth/hooks/use-auth';
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
              Workout: {
                screens: {
                  WorkoutStart: 'workout',
                  WorkoutSession: 'workout/session/:sessionId',
                  WorkoutFinishSummary: 'workout/summary/:sessionId',
                  WorkoutHistory: 'workout/history',
                },
              },
              Routines: {
                screens: {
                  RoutinesList: 'routines',
                  RoutineDetail: 'routine-detail/:id',
                  RoutineBuilder: 'routine-builder/:id',
                },
              },
              Social: {
                screens: {
                  SocialFeed: 'social',
                  PublicProfile: 'profiles/:userId',
                  PostDetail: 'posts/:postId',
                },
              },
            },
          },
          Settings: 'settings',
          Help: 'help',
        },
      },
      TrainerApp: {
        path: 'trainer',
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Workout: {
                screens: {
                  WorkoutStart: 'workout',
                  WorkoutSession: 'workout/session/:sessionId',
                  WorkoutFinishSummary: 'workout/summary/:sessionId',
                  WorkoutHistory: 'workout/history',
                },
              },
              Routines: {
                screens: {
                  RoutinesList: 'routines',
                  RoutineDetail: 'routine-detail/:id',
                  RoutineBuilder: 'routine-builder/:id',
                },
              },
              Social: {
                screens: {
                  SocialFeed: 'social',
                  PublicProfile: 'profiles/:userId',
                  PostDetail: 'posts/:postId',
                },
              },
            },
          },
          Settings: 'settings',
          Help: 'help',
        },
      },
      AdminApp: {
        path: 'admin',
        screens: {
          MainTabs: {
            screens: {
              Verifications: {
                screens: {
                  PendingVerifications: 'verifications',
                  VerificationDetail: 'verifications/:verificationId',
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
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    let active = true;
    void (async () => {
      try {
        await tokenStore.clear();
        const { data } = await api.get<MeResponse>('/auth/me');
        if (active && data?.id) {
          useSessionStore.getState().setSession(data.id, data.role, data.username,
            data.email, data.onboardingCompleted ?? null, data.emailVerified);
        }
      } catch {
        if (active) useSessionStore.getState().clearSession();
      } finally {
        if (active) useSessionStore.getState().setHasHydrated(true);
      }
    })();
    return () => { active = false; };
  }, []);
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

    // ── TASK-012 DEV BYPASS (inicio) ─────────────────────────────────
    // Sin servicio de correo, en desarrollo se entra a la app sin verificar.
    // Flujo original: if (!emailVerified) return 'PendingVerification';
    // Para probar el flujo real en desarrollo:
    //   EXPO_PUBLIC_AUTH_EMAIL_VERIFICATION_DISABLED=false
    // En producción (__DEV__ === false) el flujo original sigue activo.
    const emailVerificationDisabled =
      __DEV__ &&
      process.env.EXPO_PUBLIC_AUTH_EMAIL_VERIFICATION_DISABLED !== 'false';
    if (!emailVerified && !emailVerificationDisabled) {
      return 'PendingVerification';
    }
    // ── TASK-012 DEV BYPASS (fin) ────────────────────────────────────

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
