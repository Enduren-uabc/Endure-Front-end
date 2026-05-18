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
import AppDrawer from './AppDrawer';
import ExerciseCatalogScreen from '@/features/training/screens/exercise-catalog';
import { RootStackParamList } from './types';
import { theme } from '@/theme';

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
      AppDrawer: {
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
    if (isResolvingOnboarding) return null;
    return resolvedOnboardingCompleted === true ? 'AppDrawer' : 'OnboardingStack';
  }, [hasHydrated, isAuthenticated, isResolvingOnboarding, resolvedOnboardingCompleted]);

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
        <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
        <Stack.Screen name="AppDrawer" component={AppDrawer} />
        <Stack.Screen
          name="ExerciseCatalogModal"
          component={ExerciseCatalogScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
