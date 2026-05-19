import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'endure_access_token';
const REFRESH_TOKEN_KEY = 'endure_refresh_token';

function isWeb(): boolean {
  return Platform.OS === 'web';
}

async function safeSet(key: string, value: string): Promise<void> {
  if (isWeb()) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable in private modes or restricted browsers.
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function safeGet(key: string): Promise<string | null> {
  if (isWeb()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(key);
}

async function safeDelete(key: string): Promise<void> {
  if (isWeb()) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in private modes or restricted browsers.
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export const tokenStore = {
  setAccessToken: (token: string): Promise<void> => safeSet(ACCESS_TOKEN_KEY, token),

  getAccessToken: (): Promise<string | null> => safeGet(ACCESS_TOKEN_KEY),

  setRefreshToken: (token: string): Promise<void> => safeSet(REFRESH_TOKEN_KEY, token),

  getRefreshToken: (): Promise<string | null> => safeGet(REFRESH_TOKEN_KEY),

  clear: async (): Promise<void> => {
    await safeDelete(ACCESS_TOKEN_KEY);
    await safeDelete(REFRESH_TOKEN_KEY);
  },
};
