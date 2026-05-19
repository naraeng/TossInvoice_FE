'use client';

import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { storeAuthTokens } from '@/lib/auth-storage';
import { saveMemberProfile } from '@/lib/auth-user';

const REMEMBER_KEY = 'ti-login-remember';

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
      aria-hidden
    >
      {children}
    </span>
  );
}

export default function LoginFormCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      if (stored !== null) {
        setRemember(stored === '1');
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setRememberAndPersist = (next: boolean) => {
    setRemember(next);
    try {
      localStorage.setItem(REMEMBER_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  const canSubmit = Boolean(email.trim() && password && !isSubmitting);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-10 shadow-lg shadow-slate-200/50 sm:p-14">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-blue-600 sm:text-[1.65rem]">TossInvoice</h1>
        <p className="text-sm leading-relaxed text-slate-500">안전한 B2B 거래의 시작</p>
      </div>

      <form
        className="mt-12 space-y-10"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSubmit) return;

          setIsSubmitting(true);
          setSubmitError(null);
          try {
            const res = await apiClient.post('/api/v1/auth/login', {
              email: email.trim(),
              password,
            });

            const data = res.data as {
              result?: { accessToken?: string };
              message?: string;
            };
            const accessToken = data?.result?.accessToken;
            if (!accessToken) {
              setSubmitError('로그인 응답에 accessToken이 없습니다.');
              return;
            }

            storeAuthTokens({ accessToken, rememberLogin: remember });
            saveMemberProfile({ email: email.trim() }, remember);
            router.push('/dashboard');
          } catch (error: unknown) {
            if (typeof error === 'object' && error && 'response' in error) {
              const response = (
                error as { response?: { data?: { errorCode?: string; message?: string } } }
              ).response;
              const code = response?.data?.errorCode;
              if (code === 'AUTH_003') {
                setSubmitError('이메일 또는 비밀번호가 올바르지 않습니다.');
              } else {
                setSubmitError(response?.data?.message ?? '로그인 처리 중 오류가 발생했습니다.');
              }
            } else {
              setSubmitError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
            }
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="space-y-3">
          <label htmlFor="login-email" className="text-sm font-semibold text-slate-800">
            이메일
          </label>
          <div className="flex items-center gap-4">
            <FieldIcon>
              <Mail className="h-5 w-5" />
            </FieldIcon>
            <Input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="id@tossinvoice.com"
              className="h-12 min-w-0 flex-1 rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-[15px] text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="login-password" className="text-sm font-semibold text-slate-800">
            비밀번호
          </label>
          <div className="flex items-center gap-4">
            <FieldIcon>
              <Lock className="h-5 w-5" />
            </FieldIcon>
            <div className="relative min-w-0 flex-1">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해 주세요"
                className="h-12 w-full rounded-xl border-slate-200 bg-slate-50 py-2 pl-4 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => {
                if (v === 'indeterminate') return;
                setRememberAndPersist(v === true);
              }}
              aria-label="로그인 상태 유지"
            />
            <span>로그인 상태 유지</span>
          </label>
          <Link
            href="#"
            className="shrink-0 text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            비밀번호 찾기 →
          </Link>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-12 w-full rounded-xl text-sm font-semibold shadow-sm"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
        {submitError ? (
          <p className="text-sm font-semibold text-red-600">{submitError}</p>
        ) : null}
      </form>

      <div className="mt-10 space-y-10">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs font-medium">
          <span className="bg-white px-5 text-slate-400">또는</span>
        </div>
      </div>

        <Button
          asChild
          variant="outline"
          className="h-12 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <Link href="/signup">회원가입</Link>
        </Button>
      </div>
    </div>
  );
}
