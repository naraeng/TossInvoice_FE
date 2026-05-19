import axios from 'axios';
import {
  clearAuthTokens,
  getAccessToken,
  isRememberLoginEnabled,
  storeAuthTokens,
} from '@/lib/auth-storage';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || '';

if (!process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NODE_ENV !== 'production') {
  // Use same-origin calls in dev to avoid CORS, then proxy via next.config.ts rewrites.
  // eslint-disable-next-line no-console
  console.warn(
    '[apiClient] NEXT_PUBLIC_API_BASE_URL is not set. Using same-origin API path (/api/v1) in development.',
  );
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function reissueAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${apiBaseUrl}/api/v1/auth/reissue`,
      {},
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      },
    );
    const result = res.data?.result as
      | { accessToken?: string }
      | undefined;
    if (!result?.accessToken) return null;

    storeAuthTokens({
      accessToken: result.accessToken,
      rememberLogin: isRememberLoginEnabled(),
    });
    return result.accessToken;
  } catch {
    clearAuthTokens();
    if (typeof window !== 'undefined') {
      try {
        window.location.href = '/login';
      } catch {
        // ignore
      }
    }
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.withCredentials = true;

  // multipart/form-data: browser must set Content-Type with boundary (not application/json)
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = config.headers;
    if (headers && typeof headers === 'object') {
      if ('delete' in headers && typeof headers.delete === 'function') {
        headers.delete('Content-Type');
        headers.delete('content-type');
      } else {
        const record = headers as Record<string, unknown>;
        delete record['Content-Type'];
        delete record['content-type'];
      }
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const status = error?.response?.status;
    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = reissueAccessToken().finally(() => {
        isRefreshing = false;
      });
    }

    const newAccessToken = await refreshPromise;
    if (!newAccessToken) {
      return Promise.reject(error);
    }

    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(original);
  },
);

