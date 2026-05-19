'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import BrandLogo from '@/components/layout/BrandLogo';
import HeaderShell from '@/components/layout/HeaderShell';
import { Button } from '@/components/ui/button';
import { logout } from '@/features/auth/logout';
import { isLoggedIn } from '@/lib/auth-storage';

export default function Header() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoggedIn(await isLoggedIn());
    })();
  }, []);

  const onLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      setLoggedIn(false);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <HeaderShell contentClassName="px-10 lg:px-14">
      <BrandLogo href="/" priority />

      <nav className="hidden items-center gap-10 text-sm font-semibold text-slate-500 md:ml-12 md:flex">
        <Link className="transition hover:text-slate-900" href="/#service">
          서비스 소개
        </Link>
        <Link className="transition hover:text-slate-900" href="/#reason">
          왜 필요한가요?
        </Link>
        <Link className="transition hover:text-slate-900" href="/#compare">
          기존 방식과 비교
        </Link>
        <Link className="transition hover:text-slate-900" href="/#process">
          이용 방법
        </Link>
      </nav>

      <div className="ml-auto flex items-center justify-end gap-3 pl-2">
        {loggedIn ? (
          <Button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="h-9 rounded-lg px-4 text-sm font-semibold disabled:opacity-60"
          >
            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
          </Button>
        ) : (
          <>
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-lg border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700"
            >
              <Link href="/signup">회원가입</Link>
            </Button>
            <Button asChild className="h-9 rounded-lg px-4 text-sm font-semibold">
              <Link href="/login">로그인</Link>
            </Button>
          </>
        )}
      </div>
    </HeaderShell>
  );
}
