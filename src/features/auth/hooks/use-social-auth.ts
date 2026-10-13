import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import { apiClient, ApiError } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { tokenStore } from '@/lib/secure-token-store';
import { useSessionStore } from '@/features/auth/stores/session-store';
import type { AuthResponse } from '@/features/auth/hooks/use-auth';

const IS_MOCK = process.env.EXPO_PUBLIC_SOCIAL_AUTH_MOCK === 'true';
const MOCK_EMAIL = process.env.EXPO_PUBLIC_SOCIAL_AUTH_MOCK_EMAIL ?? 'dev@endure.com';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

WebBrowser.maybeCompleteAuthSession();

const returnUrl = makeRedirectUri({
  scheme: 'com.endure.app',
  path: 'auth/google/callback',
});

async function saveSession(data: AuthResponse, setSession: ReturnType<typeof useSessionStore.getState>['setSession']) {
  if (Platform.OS !== 'web' && data.accessToken && data.refreshToken) {
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
}

export function useGoogleAuth() {
  const setSession = useSessionStore((s) => s.setSession);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async () => {
    setError(null);
    setIsPending(true);

    try {
      if (IS_MOCK) {
        const data = await apiClient.post<AuthResponse>(
          API_ENDPOINTS.auth.socialLogin,
          { provider: 'google', idToken: `google|${MOCK_EMAIL}`, privacyAccepted: true },
        );
        await saveSession(data, setSession);
        return;
      }

      const authUrl = `${API_URL}/auth/google?returnTo=${encodeURIComponent(returnUrl)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

      if (result.type === 'cancel') {
        setIsPending(false);
        return;
      }

      if (result.type !== 'success' || !result.url) {
        setError('No se pudo completar la autenticación con Google.');
        setIsPending(false);
        return;
      }

      const url = result.url;
      const paramsIndex = url.indexOf('?');
      const params = new URLSearchParams(paramsIndex >= 0 ? url.substring(paramsIndex) : '');

      const errorParam = params.get('error');
      if (errorParam) {
        const messages: Record<string, string> = {
          access_denied: 'Cancelaste el acceso a tu cuenta de Google.',
          state_invalido: 'La sesión expiró. Intenta de nuevo.',
          cuenta_bloqueada: 'Tu cuenta está bloqueada. Contacta a soporte.',
        };
        setError(messages[errorParam] ?? 'La autenticación con Google no pudo completarse.');
        setIsPending(false);
        return;
      }

      const code = params.get('code');
      if (!code) {
        setError('No se recibió el código de autenticación.');
        setIsPending(false);
        return;
      }

      const data = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.auth.socialExchangeCode,
        { code },
      );

      await saveSession(data, setSession);
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError?.message ?? 'Error al iniciar sesión con Google. Intenta de nuevo.';
      setError(message);
    } finally {
      setIsPending(false);
    }
  }, [setSession]);

  return { login, isPending, error, clearError: () => setError(null) };
}

export function useAppleAuth() {
  const setSession = useSessionStore((s) => s.setSession);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async () => {
    setError(null);
    setIsPending(true);

    try {
      if (IS_MOCK) {
        const data = await apiClient.post<AuthResponse>(
          API_ENDPOINTS.auth.socialLogin,
          { provider: 'apple', idToken: `apple|${MOCK_EMAIL}`, privacyAccepted: true },
        );
        await saveSession(data, setSession);
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setError('No se pudo obtener la autenticación de Apple.');
        setIsPending(false);
        return;
      }

      const data = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.auth.socialLogin,
        { provider: 'apple', idToken: credential.identityToken, privacyAccepted: true },
      );

      await saveSession(data, setSession);
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('canceled')) {
        setIsPending(false);
        return;
      }
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
