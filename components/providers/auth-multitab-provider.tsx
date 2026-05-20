'use client';

import { useEffect, type ReactNode } from 'react';

import { ACCESS_TOKEN_KEY } from '@/lib/auth-storage';

/**
 * 다중 탭 간 로그인/로그아웃 동기화 Provider.
 *
 * - 어떤 탭에서 `clearAuthTokens()` 또는 `localStorage.removeItem(ACCESS_TOKEN_KEY)` 가 호출되면
 *   `storage` 이벤트가 다른 탭으로 발생함.
 * - 다른 탭에서 로그아웃이 감지되면 현재 탭도 즉시 `/login` 으로 보내고,
 *   세션 만료 안내 메시지를 노출하도록 sessionStorage reason 을 기록.
 * - 로그인 직후 새 토큰이 들어오는 경우엔 굳이 리로드하지 않음(현재 탭이 이미 인증됨).
 */
export function AuthMultiTabProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleStorage(e: StorageEvent) {
      // 다른 탭의 localStorage 변경만 트리거됨(현재 탭은 이벤트를 받지 않음).
      if (e.key !== ACCESS_TOKEN_KEY) return;
      // 토큰이 비워졌을 때(=로그아웃)만 강제 리다이렉트.
      if (e.newValue) return;
      // 이미 /login 또는 공개 경로면 굳이 또 보내지 않음.
      const path = window.location.pathname;
      if (path.startsWith('/login') || path.startsWith('/signup')) return;
      try {
        sessionStorage.setItem('auth-redirect-reason', 'logged-out-other-tab');
      } catch {
        /* ignore */
      }
      window.location.href = '/login';
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return <>{children}</>;
}
