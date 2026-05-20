'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getAccessToken } from '@/lib/auth-storage';

/**
 * 보호 페이지 진입 시 access 토큰을 확인하고, 없으면 `/login`으로 redirect.
 *
 * - middleware(Edge)에서는 localStorage 접근이 불가능하므로 page-level 가드만 제공한다.
 * - 첫 render에서 토큰이 있는지 확인하기 전까지는 `ready === false` 를 반환해
 *   호출부가 loading placeholder를 표시하도록 한다(깜빡임 최소화).
 * - 토큰이 없으면 `?reason=session-expired` 없이 `/login`으로 보내고,
 *   세션 만료로 인한 강제 로그아웃 메시지는 별도(api.ts)에서 다룬다.
 */
export function useAuthGuard(): { ready: boolean } {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  return { ready };
}
