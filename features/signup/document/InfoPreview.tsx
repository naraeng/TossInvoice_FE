import { Check, Sparkles } from 'lucide-react';

import type { OcrGateStatus } from './VerifyForm';
import { useSignupDocumentFiles } from '@/features/signup/SignupDocumentFilesProvider';

export type InfoPreviewProps = {
  ocrGateStatus: OcrGateStatus;
};

export default function InfoPreview({ ocrGateStatus }: InfoPreviewProps) {
  const { ocrExtracted } = useSignupDocumentFiles();
  const rows = ocrExtracted
    ? [
        { label: '회사명', value: ocrExtracted.companyName },
        { label: '사업자등록번호', value: ocrExtracted.businessNumber },
        { label: '대표자명', value: ocrExtracted.ceoName },
        {
          label: '과세 유형',
          value:
            ocrExtracted.companyType === 'CORPORATE'
              ? '법인/일반 과세자 - 세금계산서 발행 가능'
              : '개인/일반 과세자 - 세금계산서 발행 가능',
        },
        { label: '사업장 주소', value: ocrExtracted.address },
        {
          label: '은행 / 계좌',
          value: `${ocrExtracted.bank} ${ocrExtracted.account}`,
        },
        {
          label: '예금주',
          value: ocrExtracted.accountHolder,
          hint: ocrExtracted.isNameMatched ? '사업자명/대표자명 일치' : undefined,
        },
        { label: '업종', value: ocrExtracted.businessType },
      ]
    : [];

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-slate-900">회원정보 확인</h2>
        {ocrGateStatus === 'matched' ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI 자동 추출 완료
          </span>
        ) : ocrGateStatus === 'mismatched' ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-800 ring-1 ring-red-200/80">
            추출 불가
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80">
            대기 중
          </span>
        )}
      </div>

      {ocrGateStatus === 'matched' ? (
        rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-500">추출 정보를 불러오는 중입니다…</p>
          </div>
        ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {rows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500">{row.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{row.value}</p>
                    {row.hint ? (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                        {row.hint}
                      </p>
                    ) : null}
                  </div>
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                    strokeWidth={2.25}
                    aria-label={`${row.label} 확인됨`}
                  />
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
            <span className="mt-0.5 shrink-0 font-mono text-[11px] text-slate-400" aria-hidden>
              ⓘ
            </span>
            OCR 추출 정보는 편집할 수 없습니다 · 변경하려면 서류를 다시 올려주세요
          </p>
        </>
        )
      ) : ocrGateStatus === 'mismatched' ? (
        <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-5 sm:px-5">
          <p className="text-sm font-semibold text-red-900">
            업로드하신 사업자등록증과 통장사본이 일치하지 않습니다.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-red-800/90">
            상호·예금주 정보가 맞는지 확인한 뒤, 올바른 서류로 다시 업로드해 주세요. 일치하면 AI 추출
            결과가 오른쪽에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center sm:px-6">
          <p className="text-sm font-medium text-slate-600">서류를 모두 업로드해 주세요</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            사업자등록증의 상호 또는 대표자명이 통장사본 예금주와 같으면 OCR 추출 정보가 표시됩니다.
          </p>
        </div>
      )}
    </section>
  );
}
