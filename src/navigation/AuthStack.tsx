import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@/features/auth/screens/welcome';
import LoginScreen from '@/features/auth/screens/login';
import RegisterScreen from '@/features/auth/screens/register';
import ForgotPasswordScreen from '@/features/auth/screens/forgot-password';
import ResetPasswordScreen from '@/features/auth/screens/reset-password';
import type { AuthStackParamList } from './types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
