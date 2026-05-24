import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { usePrivacyNoticeStore } from '../stores/privacy-notice-store';
import type { PrivacyNotice, LocalPrivacyNoticeCopy } from '../types/privacy';

function isValidLocalCopy(copy: LocalPrivacyNoticeCopy | null): boolean {
  if (!copy) return false;
  if (!copy.content || copy.content.trim().length === 0) return false;
  if (!copy.version || copy.version.trim().length === 0) return false;
  if (!copy.updatedAt || copy.updatedAt.trim().length === 0) return false;
  return true;
}

export type PrivacyNoticeState =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'success'; notice: PrivacyNotice; source: 'server' | 'local'; localVersion?: string }
  | { type: 'unavailable'; message: string }
  | { type: 'updating' }
  | { type: 'updateFailed'; message: string };

function getEndpoint(): string {
  return API_ENDPOINTS.privacy.current;
}

export function usePrivacyNotice() {
  const queryClient = useQueryClient();
  const { localCopy, setLocalCopy } = usePrivacyNoticeStore();

  const query = useQuery<PrivacyNotice>({
    queryKey: ['privacy-notice', 'current'],
    queryFn: () => apiClient.get<PrivacyNotice>(getEndpoint()),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const getState = (): PrivacyNoticeState => {
    if (query.isLoading) {
      return { type: 'loading' };
    }

    if (query.isError) {
      const error = query.error as any;
      const isNetworkError =
        !error?.response ||
        error?.code === 'ERR_NETWORK' ||
        error?.message?.includes('Network');

      if (isNetworkError) {
        if (isValidLocalCopy(localCopy)) {
          return {
            type: 'success',
            notice: {
              version: localCopy!.version,
              updatedAt: localCopy!.updatedAt,
              content: localCopy!.content,
              contentHash: localCopy!.contentHash,
            },
            source: 'local',
            localVersion: localCopy!.version,
          };
        }
        return {
          type: 'unavailable',
          message: 'Aviso de privacidad no disponible. Conéctate a internet para consultar la versión más reciente.',
        };
      }

      if (error?.response?.status === 404) {
        return {
          type: 'unavailable',
          message: 'El aviso de privacidad no está disponible en este momento.',
        };
      }

      return {
        type: 'error',
        message: error?.response?.data?.message || error?.message || 'Error al cargar el aviso de privacidad',
      };
    }

    if (query.data) {
      const server = query.data;

      if (
        (localCopy && localCopy.version !== server.version) ||
        !localCopy
      ) {
        try {
          const newCopy: LocalPrivacyNoticeCopy = {
            version: server.version,
            updatedAt: server.updatedAt,
            content: server.content,
            contentHash: server.contentHash,
            storedAt: new Date().toISOString(),
          };
          setLocalCopy(newCopy);
        } catch {
          return {
            type: 'updateFailed',
            message: 'No fue posible actualizar el aviso de privacidad. Intenta de nuevo más tarde.',
          };
        }
      }

      return {
        type: 'success',
        notice: server,
        source: 'server',
      };
    }

    return { type: 'loading' };
  };

  const refetch = () => queryClient.invalidateQueries({ queryKey: ['privacy-notice', 'current'] });

  return { state: getState(), refetch };
}
