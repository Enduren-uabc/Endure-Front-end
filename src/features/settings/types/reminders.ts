export type ReminderWeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type ReminderPreferencesSource = 'mock' | 'api';
export type NotificationPermissionStatus = 'granted' | 'blocked' | 'checking' | 'unknown';

export interface ReminderPreferences {
  trainingEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  activeDays: ReminderWeekDay[];
  inactivityEnabled: boolean;
  inactivityDays: number;
  prsEnabled: boolean;
  weeklySummaryEnabled: boolean;
  trainerMessagesEnabled: boolean;
}

export interface ReminderPreferencesSnapshot {
  preferences: ReminderPreferences;
  notificationPermission: NotificationPermissionStatus;
  permissionMessage: string | null;
  trainerNotificationsAvailable: boolean;
  source: ReminderPreferencesSource;
  updatedAt: string;
}
