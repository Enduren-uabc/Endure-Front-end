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
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Error de red';
    throw new ApiError(error.response?.status ?? 0, message);
  }
  throw new ApiError(0, 'Error desconocido');
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
