import React from 'react';
import {
  buildEmptyReminderPreferences,
  buildMockReminderPreferences,
  REMINDER_MOCK_SCENARIO,
  REMINDER_SAVE_SHOULD_FAIL,
} from '../mocks/reminders.mock';
import type { ReminderPreferences, ReminderPreferencesSnapshot } from '../types/reminders';

interface ReminderPreferencesQuery {
  data: ReminderPreferencesSnapshot | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSaving: boolean;
  saveError: Error | null;
  refetch: () => void;
  savePreferences: (preferences: ReminderPreferences) => Promise<void>;
  clearSaveError: () => void;
}

function resolveMockSnapshot(): ReminderPreferencesSnapshot {
  if (REMINDER_MOCK_SCENARIO === 'empty') {
    return buildEmptyReminderPreferences();
  }

  return buildMockReminderPreferences();
}

export function useReminderPreferences(): ReminderPreferencesQuery {
  const [data, setData] = React.useState<ReminderPreferencesSnapshot | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<Error | null>(null);

  const loadPreferences = React.useCallback(() => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      if (REMINDER_MOCK_SCENARIO === 'error') {
        setData(null);
        setError(new Error('No pudimos cargar tus recordatorios. Intenta de nuevo.'));
        setIsLoading(false);
        return;
      }

      setData(resolveMockSnapshot());
      setIsLoading(false);
    }, 450);
  }, []);

  React.useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const savePreferences = React.useCallback(async (preferences: ReminderPreferences) => {
    setIsSaving(true);
    setSaveError(null);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 650);
    });

    if (REMINDER_SAVE_SHOULD_FAIL) {
      const error = new Error('No pudimos guardar tus recordatorios. Intenta de nuevo.');
      setSaveError(error);
      setIsSaving(false);
      throw error;
    }

    setData((current) => ({
      ...(current ?? buildMockReminderPreferences()),
      preferences,
      updatedAt: new Date().toISOString(),
    }));
    setIsSaving(false);
  }, []);

  return {
    data,
    isLoading,
    isError: Boolean(error),
    error,
    isSaving,
    saveError,
    refetch: loadPreferences,
    savePreferences,
    clearSaveError: () => setSaveError(null),
  };
}
