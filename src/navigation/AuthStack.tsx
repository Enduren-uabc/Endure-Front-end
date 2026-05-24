import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@/features/auth/screens/welcome';
import LoginScreen from '@/features/auth/screens/login';
import RegisterScreen from '@/features/auth/screens/register';
import ForgotPasswordScreen from '@/features/auth/screens/forgot-password';
import ResetPasswordCodeScreen from '@/features/auth/screens/reset-password-code';
import ResetPasswordScreen from '@/features/auth/screens/reset-password';
import SessionExpiredScreen from '@/features/auth/screens/session-expired';
import OAuthErrorScreen from '@/features/auth/screens/oauth-error';
import { useSessionStore } from '@/features/auth/stores/session-store';
import PrivacyScreen from '@/features/privacy/screens/PrivacyScreen';
import { theme } from '@/theme';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const sessionExpiredNotice = useSessionStore((s) => s.sessionExpiredNotice);

  return (
    <Stack.Navigator
      initialRouteName={sessionExpiredNotice ? 'SessionExpired' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPasswordCode" component={ResetPasswordCodeScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="SessionExpired" component={SessionExpiredScreen} />
      <Stack.Screen name="OAuthError" component={OAuthErrorScreen} />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          headerShown: true,
          headerTitle: 'Aviso de Privacidad',
          headerBackTitle: 'Regresar',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.textPrimary,
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
