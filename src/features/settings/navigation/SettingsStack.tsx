import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '@/features/settings/screens/settings';
import RemindersScreen from '@/features/settings/screens/reminders';
import PrivacyNoticeScreen from '@/features/settings/screens/privacy-notice';
import { theme } from '@/theme';
import type { SettingsStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        headerTitleStyle: {
          color: theme.colors.textPrimary,
          fontSize: theme.typography.heading3.fontSize,
          fontWeight: theme.typography.heading3.fontWeight,
        },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: 'Configuración', headerShown: false }}
      />
      <Stack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ title: 'Recordatorios' }}
      />
      <Stack.Screen
        name="PrivacyNotice"
        component={PrivacyNoticeScreen}
        options={{ title: 'Aviso de privacidad' }}
      />
    </Stack.Navigator>
  );
}
