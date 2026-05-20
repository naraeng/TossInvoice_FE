'use client';

import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSignupDocumentFiles } from '@/features/signup/SignupDocumentFilesProvider';
import { storeAuthTokens } from '@/lib/auth-storage';
import { saveMemberProfile } from '@/lib/auth-user';
import { apiClient } from '@/lib/api';
import { resolveErrorMessageFromError } from '@/lib/error-messages';

const REMEMBER_KEY = 'ti-login-remember';

/**
 * 로그인 화면의 "로그인 상태 유지" 체크박스 마지막 선택값을 그대로 사용.
 * 회원가입 직후 자동 로그인이 사용자가 명시적으로 선택한 흐름이 아니기 때문에,
 * 기본값(localStorage)을 강제하지 않고 마지막 사용자 선택을 따른다.
 */
function readRememberPreference(): boolean {
  try {
    const stored = localStorage.getItem(REMEMBER_KEY);
    if (stored === '1') return true;
    if (stored === '0') return false;
  } catch {
    /* ignore */
  }
  // 처음 가입한 사용자는 아직 로그인 화면을 본 적 없으므로 안전한 기본값: 미유지(=sessionStorage)
  return false;
}

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

/**
 * OCR 추출 companyType을 백엔드가 받는 두 가지 enum 값으로 normalize.
 * - 'CORPORATE' / 'INDIVIDUAL' 은 그대로 사용
 * - 'PERSONAL' 은 별칭으로만 인정해 'INDIVIDUAL' 로 매핑(과거 OCR 결과 호환)
 * - 그 외(빈 값/null/기타 문자열)는 판단 불가 → null 반환해 사용자 선택을 강제
 */
function normalizeCompanyType(value: unknown): 'CORPORATE' | 'INDIVIDUAL' | null {
  if (value === 'CORPORATE') return 'CORPORATE';
  if (value === 'INDIVIDUAL') return 'INDIVIDUAL';
  if (value === 'PERSONAL') return 'INDIVIDUAL';
  return null;
}

/** Spring @RequestPart MIME 검증용 — 브라우저가 type을 비워 둔 경우 보정 */
function asPdfFile(file: File): File {
  if (file.type === 'application/pdf') return file;
  const name = file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name}.pdf`;
  return new File([file], name, { type: 'application/pdf', lastModified: file.lastModified });
}

function asBankbookImageFile(file: File): File {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const mime =
    file.type === 'image/png' || ext === 'png'
      ? 'image/png'
      : 'image/jpeg';
  const name =
    ext === 'png' || ext === 'jpg' || ext === 'jpeg'
      ? file.name
      : `${file.name}.${mime === 'image/png' ? 'png' : 'jpg'}`;
  if (file.type === mime) return file;
  return new File([file], name, { type: mime, lastModified: file.lastModified });
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
  requiredTermsAgreed?: boolean;
  formId?: string;
  onSubmitStateChange?: (state: { canSubmit: boolean; isSubmitting: boolean }) => void;
};

/** 이메일·휴대폰·비밀번호 입력 (`document/VerifyForm`과 같이 폴더로 구분) */
export default function LoginInfoForm({
  className,
  requiredTermsAgreed = false,
  formId = 'signup-account-form',
  onSubmitStateChange,
}: LoginInfoFormProps) {
  const router = useRouter();
  const { ocrExtracted, setSubmittedSignup, businessFile, bankbookFile } = useSignupDocumentFiles();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // OCR로 companyType이 결정되지 않은 경우 사용자가 직접 선택. null이면 미선택 상태.
  const ocrCompanyType = normalizeCompanyType(
    (ocrExtracted as { companyType?: unknown } | null)?.companyType,
  );
  const [manualCompanyType, setManualCompanyType] = useState<'CORPORATE' | 'INDIVIDUAL' | null>(
    null,
  );
  const effectiveCompanyType = ocrCompanyType ?? manualCompanyType;
  const needsManualCompanyType = ocrCompanyType === null;

  // OCR이 사업장 주소를 추출하지 못한 경우 사용자가 직접 입력하도록 폴백 input 노출.
  const ocrAddress = (ocrExtracted?.address ?? '').trim();
  const needsManualAddress = !ocrAddress;
  const [manualAddress, setManualAddress] = useState('');
  const effectiveAddress = ocrAddress || manualAddress.trim();
  const addressOk = effectiveAddress.length > 0;

  const emailOk = isValidEmail(email);
  const phoneOk = isValidKrPhone(phone);
  const passwordOk = isValidPassword(password);
  const confirmOk =
    confirmPassword.length > 0 && confirmPassword === password && passwordOk;

  const emailS = fieldStatusText(email, emailOk);
  const phoneS = fieldStatusText(phone, phoneOk);
  const passwordS = fieldStatusPassword(password, passwordOk);
  const confirmS = fieldStatusPassword(confirmPassword, confirmOk);
  const canSubmit =
    Boolean(ocrExtracted?.isNameMatched) &&
    requiredTermsAgreed &&
    emailOk &&
    phoneOk &&
    passwordOk &&
    confirmOk &&
    effectiveCompanyType !== null &&
    addressOk &&
    !isSubmitting;

  useEffect(() => {
    onSubmitStateChange?.({ canSubmit, isSubmitting });
  }, [canSubmit, isSubmitting, onSubmitStateChange]);

  const inputIconPad = 'h-11 rounded-xl pr-10 placeholder:text-slate-400';

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ocrExtracted?.isNameMatched) {
      setSubmitError('서류 OCR 확인이 완료되지 않았습니다. 업로드 단계에서 먼저 확인해 주세요.');
      return;
    }
    if (!requiredTermsAgreed) {
      setSubmitError('필수 약관 동의 후 가입할 수 있어요.');
      return;
    }
    if (!emailOk || !phoneOk || !passwordOk || !confirmOk) {
      setSubmitError('입력값을 다시 확인해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (!businessFile || !bankbookFile) {
        setSubmitError('서류 파일이 없습니다. 1단계에서 사업자등록증과 통장사본을 다시 업로드해 주세요.');
        return;
      }

      // OCR이 결정해줬으면 그 값, 아니면 사용자가 선택한 값. 둘 다 없으면 차단.
      const companyType = effectiveCompanyType;
      if (!companyType) {
        setSubmitError('과세 유형(법인/개인사업자)을 선택해 주세요.');
        return;
      }

      // OCR이 주소를 비워 보내면 백엔드 REQUEST_001 — 수동 입력 강제
      if (!effectiveAddress) {
        setSubmitError('사업장 주소를 입력해 주세요.');
        return;
      }

      const signupPayload = {
        companyName: ocrExtracted.companyName,
        businessType: ocrExtracted.businessType,
        businessNumber: ocrExtracted.businessNumber,
        ceoName: ocrExtracted.ceoName,
        bank: ocrExtracted.bank,
        account: ocrExtracted.account,
        email: email.trim(),
        password,
        address: effectiveAddress,
        phone,
        companyType,
      };

      const formData = new FormData();
      formData.append(
        'data',
        new Blob([JSON.stringify(signupPayload)], { type: 'application/json' }),
        'data.json',
      );
      const businessPdf = asPdfFile(businessFile);
      const bankbookImage = asBankbookImageFile(bankbookFile);
      formData.append('businessRegistration', businessPdf, businessPdf.name);
      formData.append('bankbook', bankbookImage, bankbookImage.name);

      const res = await apiClient.post('/api/v1/auth/signup', formData);
      if (res.status === 201) {
        try {
          const loginRes = await apiClient.post('/api/v1/auth/login', {
            email: email.trim(),
            password,
          });
          const loginData = loginRes.data as {
            result?: { accessToken?: string; refreshToken?: string };
          };
          const accessToken = loginData?.result?.accessToken;
          const refreshToken = loginData?.result?.refreshToken;
          if (accessToken) {
            // 가입 직후 자동 로그인 — 사용자가 명시적으로 선택한 흐름이 아니므로 강제 true 대신
            // 로그인 화면의 마지막 "로그인 상태 유지" 선택값(localStorage)에 위임.
            const rememberLogin = readRememberPreference();
            // refreshToken까지 보관해야 토큰 만료 후 갱신 가능
            storeAuthTokens({
              accessToken,
              refreshToken,
              rememberLogin,
            });
            // accountHolder는 백엔드에 저장되지 않는 OCR 검증용 필드이므로 영속 프로필에는 보관하지 않는다.
            saveMemberProfile(
              {
                email: email.trim(),
                phone,
                companyName: ocrExtracted.companyName,
                businessNumber: ocrExtracted.businessNumber,
                ceoName: ocrExtracted.ceoName,
                companyType: companyType === 'CORPORATE' ? '법인' : '개인',
                address: effectiveAddress,
                bank: ocrExtracted.bank,
                account: ocrExtracted.account,
                businessType: ocrExtracted.businessType,
              },
              rememberLogin,
            );
          }
        } catch {
          // Ignore auto-login failure; signup itself already succeeded.
        }

        setSubmittedSignup({
          companyName: ocrExtracted.companyName,
          businessNumber: ocrExtracted.businessNumber,
          ceoName: ocrExtracted.ceoName,
          email: email.trim(),
          phone,
        });
        router.push('/signup/complete');
        return;
      }
    } catch (error: unknown) {
      setSubmitError(resolveErrorMessageFromError(error, '회원가입 처리 중 오류가 발생했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id={formId} className={cn('min-w-0 space-y-6', className)} onSubmit={onSubmit}>
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
      {needsManualAddress ? (
        <div className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-800">사업장 주소</span>
          <p className="text-xs text-slate-400">
            서류에서 자동으로 인식하지 못했어요. 직접 입력해 주세요.
          </p>
          <Input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="예: 서울특별시 중구 세종대로 110"
            aria-invalid={!addressOk}
            className={cn('h-11 rounded-xl', !addressOk && manualAddress.length > 0 && 'border-red-300')}
          />
        </div>
      ) : null}
      {needsManualCompanyType ? (
        <div className="space-y-1.5">
          <span className="text-sm font-semibold text-slate-800">과세 유형</span>
          <p className="text-xs text-slate-400">
            서류에서 자동으로 판별하지 못했어요. 직접 선택해 주세요.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setManualCompanyType('CORPORATE')}
              className={cn(
                'h-11 flex-1 rounded-xl border text-sm font-semibold transition',
                manualCompanyType === 'CORPORATE'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              법인사업자
            </button>
            <button
              type="button"
              onClick={() => setManualCompanyType('INDIVIDUAL')}
              className={cn(
                'h-11 flex-1 rounded-xl border text-sm font-semibold transition',
                manualCompanyType === 'INDIVIDUAL'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              개인사업자
            </button>
          </div>
        </div>
      ) : null}
      {submitError ? <p className="text-sm font-semibold text-red-600">{submitError}</p> : null}
      {!requiredTermsAgreed ? (
        <p className="text-xs text-slate-400">필수 약관 동의 후 가입 버튼이 활성화됩니다.</p>
      ) : null}
    </form>
  );
}
