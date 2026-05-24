import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import { apiClient, ApiError } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { tokenStore } from '@/lib/secure-token-store';
import { useSessionStore } from '@/features/auth/stores/session-store';
import type { AuthResponse } from '@/features/auth/hooks/use-auth';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
});

const redirectUri = makeRedirectUri({
  scheme: 'com.endure.app',
  path: 'auth/google/callback',
});

export function useGoogleAuth() {
  const setSession = useSessionStore((s) => s.setSession);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, , promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID ?? '',
      redirectUri,
      scopes: ['openid', 'email', 'profile'],
      responseType: 'id_token',
      extraParams: {
        nonce: 'nonce',
      },
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    },
  );

  const login = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In no está configurado. Contacta al administrador.');
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const result = await promptAsync();

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setError('Cancelaste el inicio con Google. Puedes intentarlo de nuevo o usar tu correo.');
        setIsPending(false);
        return;
      }

      if (result.type !== 'success' || !result.params?.id_token) {
        setError('No se pudo obtener la autenticación de Google.');
        setIsPending(false);
        return;
      }

      const data = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.auth.socialLogin,
        {
          provider: 'google',
          idToken: result.params.id_token,
          privacyAccepted: true,
        },
      );

      if (data.accessToken && data.refreshToken) {
        await tokenStore.setAccessToken(data.accessToken);
        await tokenStore.setRefreshToken(data.refreshToken);
      }

      setSession(
        data.id,
        data.role,
        data.username,
        data.email,
        data.onboardingCompleted ?? null,
        data.emailVerified,
      );
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError?.message ?? 'Error al iniciar sesión con Google. Intenta de nuevo.';
      setError(message);
    } finally {
      setIsPending(false);
    }
  }, [promptAsync, setSession]);

  return { login, isPending, error, clearError: () => setError(null) };
}

export function useAppleAuth() {
  const setSession = useSessionStore((s) => s.setSession);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (_idToken: string) => {
    setError(null);
    setIsPending(true);

    try {
      const data = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.auth.socialLogin,
        {
          provider: 'apple',
          idToken: _idToken,
          privacyAccepted: true,
        },
      );

      if (data.accessToken && data.refreshToken) {
        await tokenStore.setAccessToken(data.accessToken);
        await tokenStore.setRefreshToken(data.refreshToken);
      }

      setSession(
        data.id,
        data.role,
        data.username,
        data.email,
        data.onboardingCompleted ?? null,
        data.emailVerified,
      );
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError?.message ?? 'Error al iniciar sesión con Apple. Intenta de nuevo.';
      setError(message);
    } finally {
      setIsPending(false);
    }
  }, [setSession]);

  return { login, isPending, error, clearError: () => setError(null) };
}
