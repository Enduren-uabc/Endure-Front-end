import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { useSessionStore } from '@/features/auth/stores/session-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = [];

function processQueue(error: AxiosError | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        useSessionStore.getState().clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      useSessionStore.getState().clearSession();
    }

    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = 'API_ERROR',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getUserMessage(status: number): string {
  if (status === 0) return 'Revisa tu conexión a internet e intenta de nuevo.';
  if (status === 400) return 'Revisa los datos ingresados.';
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (status === 404) return 'No encontramos lo que buscas.';
  if (status === 409) return 'Ya existe un recurso con esos datos.';
  if (status === 422) return 'Algunos datos no son válidos. Revísalos e intenta de nuevo.';
  return 'Tuvimos un problema. Intenta de nuevo en un momento.';
}

function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    throw new ApiError(status, getUserMessage(status));
  }
  throw new ApiError(0, getUserMessage(0));
}

export const apiClient = {
  get: async <T>(path: string): Promise<T> => {
    try {
      const { data } = await api.get<T>(path);
      return data;
    } catch (error) {
      handleError(error);
    }
  },
  post: async <T>(path: string, body?: unknown): Promise<T> => {
    try {
      const { data } = await api.post<T>(path, body);
      return data;
    } catch (error) {
      handleError(error);
    }
  },
  patch: async <T>(path: string, body?: unknown): Promise<T> => {
    try {
      const { data } = await api.patch<T>(path, body);
      return data;
    } catch (error) {
      handleError(error);
    }
  },
  del: async <T>(path: string): Promise<T> => {
    try {
      const { data } = await api.delete<T>(path);
      return data;
    } catch (error) {
      handleError(error);
    }
  },
};
