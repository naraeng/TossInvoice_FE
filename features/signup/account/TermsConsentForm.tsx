'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const TERMS = [
  { id: 't1', required: true, label: '서비스 이용약관' },
  { id: 't2', required: true, label: '개인정보 처리방침' },
  { id: 't3', required: true, label: '전자금융거래 이용약관' },
  { id: 't4', required: false, label: '마케팅 정보 수신' },
] as const;

type TermId = (typeof TERMS)[number]['id'];

/** 실제 법무 문구 대신 UI 확인용 예시 본문 */
const TERM_SAMPLE_BODY: Record<TermId, string> = {
  t1: `제1조 (목적)
이 약관은 Toss Invoice(이하 "서비스")의 이용과 관련하여 회사와 이용자 간 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
① "이용자"란 본 약관에 따라 서비스를 이용하는 자를 말합니다.
② "콘텐츠"란 서비스 내에서 제공되는 전자문서, 안내, 도움말 등을 말합니다.

제3조 (약관의 효력)
본 문구는 화면 예시용이며, 실제 서비스 오픈 시 법무 검토를 거친 최종 약관으로 교체됩니다.`,
  t2: `1. 수집 항목 (예시)
가. 필수: 이메일, 비밀번호, 사업자등록정보 등
나. 선택: 마케팅 수신 동의 시 연락처

2. 이용 목적
회원 식별, 서비스 제공, 고지·통지, 부정이용 방지

3. 보관 및 파기
관련 법령에 따른 보관 기간 경과 후 지체 없이 파기합니다.

※ 본문은 예시이며 실제 개인정보처리방침으로 대체됩니다.`,
  t3: `제1조 (적용 범위)
전자금융거래법 등 관련 법령이 정하는 바에 따라 전자적 수단을 통한 금융거래에 관한 사항을 규정합니다.

제2조 (전자금융거래의 성립)
이용자가 전자적 장치를 통해 거래 의사를 표시하고 회사가 이를 승낙한 때 거래가 성립합니다.

※ 예시 문구이며, 실제 전자금융거래 약관은 별도 검토 후 반영합니다.`,
  t4: `이벤트·신규 기능·혜택 등 마케팅 정보를 이메일·문자·앱 푸시 등으로 받아보실 수 있습니다.

동의하지 않아도 서비스 이용에는 제한이 없으며, 동의 후에도 설정에서 언제든 철회할 수 있습니다.

※ 예시 안내입니다.`,
};

export type TermsConsentFormProps = {
  className?: string;
  onRequiredConsentChange?: (agreed: boolean) => void;
};

/** 약관 동의 체크 (`document/VerifyForm`과 같이 폴더로 구분) */
export default function TermsConsentForm({ className, onRequiredConsentChange }: TermsConsentFormProps) {
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [viewingId, setViewingId] = useState<TermId | null>(null);
  const dialogTitleId = useId();

  const allRequiredChecked = TERMS.filter((t) => t.required).every((t) => agreed[t.id]);
  const allChecked = TERMS.every((t) => agreed[t.id]);

  const viewingTerm = viewingId ? TERMS.find((t) => t.id === viewingId) : null;

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    TERMS.forEach((t) => {
      next[t.id] = checked;
    });
    setAgreed(next);
  };

  useEffect(() => {
    onRequiredConsentChange?.(allRequiredChecked);
  }, [allRequiredChecked, onRequiredConsentChange]);

  useEffect(() => {
    if (!viewingId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewingId(null);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [viewingId]);

  const termModal =
    viewingId && viewingTerm && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"
              aria-label="닫기"
              onClick={() => setViewingId(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className="relative z-[111] flex max-h-[min(85vh,640px)] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <p id={dialogTitleId} className="text-lg font-bold text-slate-900">
                  {viewingTerm.label}
                </p>
                <p className="mt-1 text-xs text-slate-500">아래는 화면 구성용 예시 문구입니다.</p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                  {TERM_SAMPLE_BODY[viewingId]}
                </pre>
              </div>
              <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                <Button
                  type="button"
                  className="w-full rounded-xl font-semibold"
                  onClick={() => setViewingId(null)}
                >
                  확인
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <aside
      className={cn(
        'min-w-0 lg:border-l lg:border-slate-100 lg:pl-8 xl:pl-10',
        className,
      )}
    >
      <Card className="rounded-2xl border-slate-200 shadow-sm ring-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-slate-900">약관 동의</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="rounded-xl bg-blue-50/80 p-3 ring-1 ring-blue-100">
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={allChecked}
                onCheckedChange={(v) => toggleAll(v === true)}
                aria-label="전체 동의"
              />
              <span className="text-sm font-bold text-slate-900">전체 동의</span>
            </label>
          </div>

          <ul className="space-y-3">
            {TERMS.map((t) => (
              <li key={t.id}>
                <div className="flex items-start justify-between gap-2">
                  <label className="flex flex-1 cursor-pointer items-start gap-2.5">
                    <Checkbox
                      className="mt-0.5"
                      checked={agreed[t.id] === true}
                      onCheckedChange={(v) =>
                        setAgreed((prev) => ({ ...prev, [t.id]: v === true }))
                      }
                    />
                    <span className="text-sm leading-snug text-slate-800">
                      {t.required ? (
                        <span className="font-semibold text-red-500">[필수]</span>
                      ) : (
                        <span className="font-medium text-slate-400">[선택]</span>
                      )}{' '}
                      {t.label}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-blue-600 underline-offset-2 hover:text-blue-700 hover:underline"
                    onClick={() => setViewingId(t.id)}
                  >
                    보기 →
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {!allRequiredChecked && (
            <p className="text-xs text-slate-400">필수 약관에 모두 동의해야 가입할 수 있어요.</p>
          )}
        </CardContent>
      </Card>
      {termModal}
    </aside>
  );
}
