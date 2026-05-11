import React from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useOnboardingStatus } from '@/features/onboarding/hooks/use-onboarding';
import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import AppDrawer from './AppDrawer';
import { RootStackParamList } from './types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RootNavigator() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const onboardingCompleted = useSessionStore((s) => s.onboardingCompleted);
  const setOnboardingCompleted = useSessionStore((s) => s.setOnboardingCompleted);
  const isHydrated = useSessionStore((s) => s.isHydrated);

  const {
    data: onboardingStatus,
    isLoading: isOnboardingLoading,
  } = useOnboardingStatus(isAuthenticated && isHydrated);

  // Sync backend onboarding status into the session store
  React.useEffect(() => {
    if (onboardingStatus) {
      setOnboardingCompleted(onboardingStatus.completed);
    }
  }, [onboardingStatus, setOnboardingCompleted]);

  const getRouteName = (): keyof RootStackParamList => {
    if (!isAuthenticated) return 'AuthStack';
    if (isOnboardingLoading) return 'AuthStack';
    if (!onboardingCompleted) return 'OnboardingStack';
    return 'AppDrawer';
  };

  const previousRouteRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const currentRoute = getRouteName();
    if (
      navigationRef.isReady() &&
      previousRouteRef.current !== null &&
      previousRouteRef.current !== currentRoute
    ) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: currentRoute }],
      });
    }
    previousRouteRef.current = currentRoute;
  }, [isAuthenticated, onboardingCompleted, isOnboardingLoading]);

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated && isOnboardingLoading) {
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
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={getRouteName()}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
        <Stack.Screen name="AppDrawer" component={AppDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
