'use client';

import Link from 'next/link';
import { Bell, LogOut, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { logout } from '@/features/auth/logout';
import BrandLogo from '@/components/layout/BrandLogo';
import HeaderShell from '@/components/layout/HeaderShell';
import { Button } from '@/components/ui/button';
import { getDisplayProfile } from '@/lib/auth-user';
import { useNotifications } from '@/lib/use-notifications';

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
  const { notices, loading: notifLoading, hasNext, loadingMore, loadMore } = useNotifications();

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
    const nextProfile = getDisplayProfile();
    setProfile({
      companyName: nextProfile.companyName,
      ceoName: nextProfile.ceoName,
    });
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
            {notices.length > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_-8px_rgba(15,23,42,0.18)]">
              <div className="border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-bold text-slate-900">알림</span>
              </div>
              <ul className="max-h-[420px] divide-y divide-slate-50 overflow-y-auto">
                {notifLoading ? (
                  <li className="px-4 py-6 text-center text-xs text-slate-400">불러오는 중...</li>
                ) : notices.length === 0 ? (
                  <li className="px-4 py-6 text-center text-xs text-slate-400">새 알림이 없습니다.</li>
                ) : (
                  notices.map((n) => (
                    <li
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-slate-50"
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
                        <p className="mt-0.5 truncate text-xs text-slate-400">{n.desc}</p>
                        {(n.senderCompanyName ?? n.tradeTotalAmount) ? (
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {n.senderCompanyName && (
                              <span className="font-medium text-slate-500">{n.senderCompanyName}</span>
                            )}
                            {n.senderCompanyName && n.tradeTotalAmount ? ' · ' : ''}
                            {n.tradeTotalAmount !== null && (
                              <span>{n.tradeTotalAmount.toLocaleString('ko-KR')}원</span>
                            )}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-300">{n.time}</span>
                    </li>
                  ))
                )}
              </ul>
              {hasNext && (
                <div className="border-t border-slate-100 px-4 py-2.5">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={loadMore}
                    className="w-full rounded-lg py-1.5 text-center text-xs font-semibold text-blue-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loadingMore ? '불러오는 중...' : '더 보기'}
                  </button>
                </div>
              )}
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
