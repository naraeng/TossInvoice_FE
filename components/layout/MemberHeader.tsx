'use client';

import Link from 'next/link';
import { Bell, LogOut, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { logout } from '@/features/auth/logout';
import BrandLogo from '@/components/layout/BrandLogo';
import HeaderShell from '@/components/layout/HeaderShell';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { isRememberLoginEnabled } from '@/lib/auth-storage';
import { getDisplayProfile, saveMemberProfile } from '@/lib/auth-user';
import { noticeHref } from '@/lib/notices';
import { useNotifications } from '@/lib/use-notifications';

type MyInfoResponse = {
  result?: {
    companyName?: string;
    ceoName?: string;
  } | null;
};

const navItems = [
  { label: '홈', href: '/dashboard', match: '/dashboard' },
  { label: '거래', href: '/trade', match: '/trade' },
] as const;

export default function MemberHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState(() => ({
    companyName: '',
    ceoName: '',
  }));
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);
  const {
    notices,
    loading: notifLoading,
    hasNext,
    loadingMore,
    loadMore,
    unreadCount,
    markAllSeen,
  } = useNotifications();

  // 드롭다운이 열릴 때 최신 notificationId 를 lastSeen 으로 저장해 빨간 점 제거
  useEffect(() => {
    if (notifOpen) markAllSeen();
  }, [notifOpen, markAllSeen]);

  // 무한 스크롤: 드롭다운 안 sentinel 이 보이면 loadMore
  useEffect(() => {
    if (!notifOpen || !hasNext) return;
    const root = listRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMore();
          }
        }
      },
      { root, rootMargin: '40px', threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [notifOpen, hasNext, loadMore, notices.length]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleOpenNotif() { setNotifOpen(true); }
    window.addEventListener('open-notifications', handleOpenNotif);
    return () => window.removeEventListener('open-notifications', handleOpenNotif);
  }, []);

  useEffect(() => {
    // 1) 캐시된 값으로 즉시 표시
    const cached = getDisplayProfile();
    setProfile({
      companyName: cached.companyName,
      ceoName: cached.ceoName,
    });

    // 2) /users/me 로 최신 값 가져와서 갱신 + 저장 (다른 페이지 의존 없이 자체적으로)
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get('/api/v1/users/me');
        if (cancelled) return;
        const me = (res.data as MyInfoResponse)?.result;
        const companyName = me?.companyName ?? '';
        const ceoName = me?.ceoName ?? '';
        if (!companyName && !ceoName) return;
        setProfile({ companyName, ceoName });
        saveMemberProfile({ companyName, ceoName }, isRememberLoginEnabled());
      } catch {
        // 토큰 만료 등 — 캐시 값 유지
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const companyLabel = profile.companyName || '내 회사';
  const roleLabel = profile.ceoName ? `${profile.ceoName} 담당자` : '회원';
  const avatar = (companyLabel[0] ?? '나').toUpperCase();

  const onLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <HeaderShell contentClassName="px-10 lg:px-14">
      <BrandLogo href="/dashboard" priority />

      <nav className="hidden items-center gap-10 md:ml-12 md:flex">
        {navItems.map((item) => {
          const isActive = pathname === item.match || pathname.startsWith(`${item.match}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative text-sm font-semibold transition ${
                isActive
                  ? 'text-blue-600 after:absolute after:-bottom-[18px] after:left-0 after:h-0.5 after:w-full after:bg-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center justify-end gap-5 pl-2">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
            aria-label="알림"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.18)]">
              <div className="border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-bold text-slate-900">알림</span>
              </div>
              <ul ref={listRef} className="max-h-[420px] divide-y divide-slate-50 overflow-y-auto">
                {notifLoading ? (
                  <li className="px-4 py-6 text-center text-xs text-slate-400">불러오는 중...</li>
                ) : notices.length === 0 ? (
                  <li className="px-4 py-6 text-center text-xs text-slate-400">새 알림이 없습니다.</li>
                ) : (
                  <>
                    {notices.map((n) => {
                      const href = noticeHref(n);
                      const handleClick = () => {
                        if (!href) return;
                        setNotifOpen(false);
                        router.push(href);
                      };
                      const clickable = href != null;
                      return (
                        <li
                          key={n.id}
                          onClick={clickable ? handleClick : undefined}
                          role={clickable ? 'button' : undefined}
                          tabIndex={clickable ? 0 : undefined}
                          onKeyDown={
                            clickable
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleClick();
                                  }
                                }
                              : undefined
                          }
                          className={`flex items-start gap-3 px-4 py-3.5 transition ${
                            clickable ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                          }`}
                        >
                          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            n.icon === 'alert' ? 'bg-red-100 text-red-500' :
                            n.icon === 'check' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {n.icon === 'alert' && <AlertCircle className="h-3.5 w-3.5" />}
                            {n.icon === 'check' && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {n.icon === 'info' && <Info className="h-3.5 w-3.5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <p className="mt-0.5 whitespace-normal break-words text-xs text-slate-400">{n.desc}</p>
                            {n.senderCompanyName && (
                              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                {n.senderCompanyName}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 text-[11px] text-slate-300">{n.time}</span>
                        </li>
                      );
                    })}
                    {hasNext && (
                      <li
                        ref={sentinelRef}
                        className="px-4 py-3 text-center text-[11px] text-slate-400"
                      >
                        {loadingMore ? '불러오는 중...' : ''}
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push('/mypage')}
          className="flex cursor-pointer items-center gap-2 border-l border-slate-100 pl-4 text-left transition hover:opacity-90"
          aria-label="마이페이지로 이동"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {avatar}
          </div>
          <div className="hidden text-sm leading-tight sm:block">
            <p className="font-semibold text-slate-900">{companyLabel}</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
        </button>
        <Button
          type="button"
          variant="outline"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="h-9 gap-1 rounded-lg border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
          aria-label="로그아웃"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </Button>
      </div>
    </HeaderShell>
  );
}
