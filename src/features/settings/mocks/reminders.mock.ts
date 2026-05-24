import type { ReminderPreferences, ReminderPreferencesSnapshot } from '../types/reminders';

export type ReminderMockScenario = 'success' | 'empty' | 'error';

export const REMINDER_MOCK_SCENARIO: ReminderMockScenario = 'success';
export const REMINDER_SAVE_SHOULD_FAIL = false;

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  trainingEnabled: true,
  reminderHour: 7,
  reminderMinute: 30,
  activeDays: ['monday', 'wednesday', 'friday'],
  inactivityEnabled: true,
  inactivityDays: 3,
  prsEnabled: true,
  weeklySummaryEnabled: true,
  trainerMessagesEnabled: true,
};

export const EMPTY_REMINDER_PREFERENCES: ReminderPreferences = {
  trainingEnabled: false,
  reminderHour: 7,
  reminderMinute: 30,
  activeDays: [],
  inactivityEnabled: false,
  inactivityDays: 3,
  prsEnabled: false,
  weeklySummaryEnabled: false,
  trainerMessagesEnabled: false,
};

export function buildMockReminderPreferences(
  preferences: ReminderPreferences = DEFAULT_REMINDER_PREFERENCES,
): ReminderPreferencesSnapshot {
  return {
    preferences,
    notificationPermission: 'granted',
    permissionMessage: null,
    trainerNotificationsAvailable: true,
    source: 'mock',
    updatedAt: '2026-05-24T12:00:00.000Z',
  };
}

export function buildEmptyReminderPreferences(): ReminderPreferencesSnapshot {
  return buildMockReminderPreferences(EMPTY_REMINDER_PREFERENCES);
}
