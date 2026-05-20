export const ACCESS_TOKEN_KEY = 'ti-access-token';
export const REFRESH_TOKEN_KEY = 'ti-refresh-token';
// REFRESH_TOKEN_KEY가 LEGACY 목록에 있으면 clearAuthTokens가 매번 새 키를 지움 → 제외
const LEGACY_TOKEN_KEYS = ['token', 'accessToken', 'refreshToken'] as const;

export function storeAuthTokens(params: {
  accessToken: string;
  /** RTR 갱신 응답에서 함께 내려오는 새 refreshToken (선택) */
  refreshToken?: string;
  rememberLogin: boolean;
}) {
  const { accessToken, refreshToken, rememberLogin } = params;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);

    if (rememberLogin) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      storeRefreshToken(refreshToken, rememberLogin);
    }
  } catch {
    // Ignore storage errors in non-browser or restricted environments.
  }
}

/** refreshToken 단독 저장 — login/signup/reissue 응답 모두에서 호출 */
export function storeRefreshToken(refreshToken: string, rememberLogin: boolean) {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);

    if (rememberLogin) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch {
    // ignore
  }
}

export function getRefreshToken(): string | null {
  try {
    const localValue = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (localValue) return localValue;

    const sessionValue = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (sessionValue) return sessionValue;
  } catch {
    return null;
  }
  return null;
}

export function clearRefreshToken() {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getAccessToken(): string | null {
  try {
    const localAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (localAccess) return localAccess;

    const sessionAccess = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (sessionAccess) return sessionAccess;
  } catch {
    return null;
  }
  return null;
}

export function clearAuthTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    for (const legacyKey of LEGACY_TOKEN_KEYS) {
      localStorage.removeItem(legacyKey);
      sessionStorage.removeItem(legacyKey);
    }
  } catch {
    // Ignore storage errors.
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}

export function isRememberLoginEnabled(): boolean {
  try {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  } catch {
    return false;
  }
}
