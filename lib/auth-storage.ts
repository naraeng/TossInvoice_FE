export const ACCESS_TOKEN_KEY = 'ti-access-token';
const LEGACY_TOKEN_KEYS = ['token', 'accessToken', 'refreshToken', 'ti-refresh-token'] as const;

export function storeAuthTokens(params: {
  accessToken: string;
  rememberLogin: boolean;
}) {
  const { accessToken, rememberLogin } = params;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);

    if (rememberLogin) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
  } catch {
    // Ignore storage errors in non-browser or restricted environments.
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
