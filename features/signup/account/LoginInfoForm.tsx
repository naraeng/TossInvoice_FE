'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function isValidEmail(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function isValidKrPhone(s: string): boolean {
  const d = s.replace(/\D/g, '');
  return /^(01[016789])\d{7,8}$/.test(d);
}

function isValidPassword(s: string): boolean {
  if (s.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(s);
  const hasDigit = /\d/.test(s);
  const hasSpecial = /[^A-Za-z0-9]/.test(s);
  return hasLetter && hasDigit && hasSpecial;
}

type FieldStatus = 'empty' | 'ok' | 'bad';

function fieldStatusText(value: string, valid: boolean): FieldStatus {
  if (!value.trim()) return 'empty';
  return valid ? 'ok' : 'bad';
}

function fieldStatusPassword(value: string, valid: boolean): FieldStatus {
  if (value.length === 0) return 'empty';
  return valid ? 'ok' : 'bad';
}

function FieldStatusIcon({ status }: { status: FieldStatus }) {
  if (status === 'empty') return null;
  if (status === 'ok') {
    return (
      <span
        className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-white"
        aria-hidden
      >
        <Check className="h-3 w-3 stroke-[3]" />
      </span>
    );
  }
  return (
    <span
      className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-white"
      aria-hidden
    >
      <X className="h-3 w-3 stroke-[3]" />
    </span>
  );
}

export type LoginInfoFormProps = {
  className?: string;
};

/** 이메일·휴대폰·비밀번호 입력 (`document/VerifyForm`과 같이 폴더로 구분) */
export default function LoginInfoForm({ className }: LoginInfoFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const emailOk = isValidEmail(email);
  const phoneOk = isValidKrPhone(phone);
  const passwordOk = isValidPassword(password);
  const confirmOk =
    confirmPassword.length > 0 && confirmPassword === password && passwordOk;

  const emailS = fieldStatusText(email, emailOk);
  const phoneS = fieldStatusText(phone, phoneOk);
  const passwordS = fieldStatusPassword(password, passwordOk);
  const confirmS = fieldStatusPassword(confirmPassword, confirmOk);

  const inputIconPad = 'h-11 rounded-xl pr-10 placeholder:text-slate-400';

  return (
    <section className={cn('min-w-0 space-y-6', className)}>
      <div>
        <h2 className="text-lg font-bold text-slate-900">로그인 정보</h2>
        <p className="mt-1 text-sm text-slate-500">가입 후에도 이메일로 로그인할 수 있어요.</p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-800">이메일 (로그인 아이디)</span>
          <div className="relative">
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="id@tossinvoice.com"
              aria-invalid={emailS === 'bad'}
              className={cn(inputIconPad, emailS === 'bad' && 'border-red-300')}
            />
            <FieldStatusIcon status={emailS} />
          </div>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-800">핸드폰 번호</span>
          <div className="relative">
            <Input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                setPhone(digits);
              }}
              placeholder="01012345678"
              aria-invalid={phoneS === 'bad'}
              className={cn(inputIconPad, phoneS === 'bad' && 'border-red-300')}
            />
            <FieldStatusIcon status={phoneS} />
          </div>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-800">비밀번호</span>
          <div className="relative">
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 · 영문/숫자/특수문자 조합"
              aria-invalid={passwordS === 'bad'}
              className={cn(inputIconPad, passwordS === 'bad' && 'border-red-300')}
            />
            <FieldStatusIcon status={passwordS} />
          </div>
          <p className="text-xs text-slate-400">8자 이상 · 영문/숫자/특수문자 조합</p>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-800">비밀번호 확인</span>
          <div className="relative">
            <Input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 한 번 더 입력해 주세요"
              aria-invalid={confirmS === 'bad'}
              className={cn(inputIconPad, confirmS === 'bad' && 'border-red-300')}
            />
            <FieldStatusIcon status={confirmS} />
          </div>
        </label>
      </div>
    </section>
  );
}
