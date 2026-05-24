import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReminderListScreen from '@/features/reminders/screens/reminder-list';
import ReminderCreateScreen from '@/features/reminders/screens/reminder-create';
import ReminderEditScreen from '@/features/reminders/screens/reminder-edit';
import NotificationListScreen from '@/features/reminders/screens/notification-list';
import type { RemindersStackParamList } from './types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<RemindersStackParamList>();

export default function RemindersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="ReminderList" component={ReminderListScreen} />
      <Stack.Screen name="ReminderCreate" component={ReminderCreateScreen} />
      <Stack.Screen name="ReminderEdit" component={ReminderEditScreen} />
      <Stack.Screen name="NotificationList" component={NotificationListScreen} />
    </Stack.Navigator>
  );
}
