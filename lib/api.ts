import axios from 'axios';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  isRememberLoginEnabled,
  storeAuthTokens,
} from '@/lib/auth-storage';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function reissueAccessToken(): Promise<string | null> {
  // 백엔드 @NotBlank — refreshToken을 본문에 실어야 함. 저장된 게 없으면 시도 불가
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthTokens();
    if (typeof window !== 'undefined') {
      try {
        // /login 진입 시 만료 메시지를 노출하도록 reason 기록
        try {
          sessionStorage.setItem('auth-redirect-reason', 'session-expired');
        } catch {
          /* ignore storage failure */
        }
        window.location.href = '/login';
      } catch {
        // ignore
      }
    }
    return null;
  }

  try {
    const res = await axios.post(
      '/api/v1/auth/reissue',
      { refreshToken },
      {
        baseURL: resolveApiBaseUrl(),
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      },
    );
    const result = res.data?.result as
      | { accessToken?: string; refreshToken?: string }
      | undefined;
    if (!result?.accessToken) return null;

    // RTR(Rotating Refresh Token): 응답에 새 refreshToken이 오면 함께 저장
    storeAuthTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      rememberLogin: isRememberLoginEnabled(),
    });
    return result.accessToken;
  } catch {
    clearAuthTokens();
    if (typeof window !== 'undefined') {
      try {
        // /login 진입 시 만료 메시지를 노출하도록 reason 기록
        try {
          sessionStorage.setItem('auth-redirect-reason', 'session-expired');
        } catch {
          /* ignore storage failure */
        }
        window.location.href = '/login';
      } catch {
        // ignore
      }
    }
    return null;
  }
}

function deleteContentTypeHeader(headers: unknown) {
  if (!headers) return;

  if (typeof (headers as { delete?: (k: string) => void }).delete === 'function') {
    (headers as { delete: (k: string) => void }).delete('Content-Type');
    (headers as { delete: (k: string) => void }).delete('content-type');
    return;
  }

  delete (headers as Record<string, unknown>)['Content-Type'];
  delete (headers as Record<string, unknown>)['content-type'];
}

apiClient.interceptors.request.use((config) => {
  config.baseURL = resolveApiBaseUrl();

  const method = config.method?.toLowerCase();

  // GET에 application/json이 붙으면 Spring이 400을 반환하는 경우가 있음
  if (method === 'get' || method === 'head' || method === 'delete') {
    deleteContentTypeHeader(config.headers);
  }

  // FormData는 Content-Type을 브라우저/axios가 boundary 포함해 설정해야 함
  if (config.data instanceof FormData) {
    deleteContentTypeHeader(config.headers);
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.withCredentials = true;

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

