'use client';

import { Check, Info, Lock, Shield } from 'lucide-react';

import { type DocumentAction } from '@/components/documents/DocumentActionBar';
import { Button } from '@/components/ui/button';
import { PROTECTION_FEATURES, calcTransactionFee } from '@/features/documents/quote/supplier/constants';
import { formatKRW } from '@/lib/documents/format';
import { calcPaymentSplit, resolveDownPaymentPercent } from '@/lib/documents/payment-terms';
import { cn } from '@/lib/utils';
import type { Totals } from '@/types/documents/document';

type Props = {
  totals: Totals;
  downPaymentPercent?: number;
  paymentTerms?: string;
  actions: DocumentAction[];
};

function SidebarDivider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-slate-100', className)} />;
}

export function SupplierQuoteDraftSidebar({
  totals,
  downPaymentPercent,
  paymentTerms,
  actions,
}: Props) {
  const fee = calcTransactionFee(totals.total);
  const percent = resolveDownPaymentPercent({ downPaymentPercent, paymentTerms });
  const { downPayment, balance } = calcPaymentSplit(totals, percent);

  const paymentSteps = [
    { title: 'PO 합의 후', description: `선금 ${formatKRW(downPayment)} 자동 송금` },
    { title: '토큰 활성화', description: '거래처 변경 시 자동 정지' },
    { title: '납품 확인 시', description: `잔금 ${formatKRW(balance)} 자동 송금` },
  ];

  const primaryAction = actions.find((a) => a.variant === 'primary');
  const secondaryAction = actions.find((a) => a.variant === 'secondary');

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-[#3182F6]" aria-hidden />

      <div className="p-6">
        <h2 className="text-sm font-bold text-[#3182F6]">🔒 안전결제 요약</h2>

        <div className="mt-6">
          <p className="text-sm font-bold text-slate-800">결제 흐름</p>
          <ol className="relative mt-4 space-y-5">
            <div className="absolute left-[13px] top-2 bottom-2 w-px bg-slate-200" aria-hidden />
            {paymentSteps.map((step, index) => (
              <li key={step.title} className="relative flex gap-3">
                <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#3182F6] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <div className="pt-0.5">
                  <p className="text-sm font-bold text-slate-900">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <SidebarDivider className="my-6" />

        <div>
          <p className="text-sm font-bold text-slate-800">🛡 보호 장치</p>
          <ul className="mt-3 space-y-2.5">
            {PROTECTION_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" strokeWidth={3} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <SidebarDivider className="my-6" />

        <div className="rounded-xl bg-[#F8F9FA] px-4 py-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>토스인보이스 수수료</span>
            <span className="font-semibold text-[#3182F6]">0.2%</span>
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{formatKRW(fee)}</p>
          <p className="mt-1 text-[11px] text-slate-400">거래액의 0.2% · 무료 한도 잔여 8건</p>
        </div>

        <div className="mt-4 space-y-2">
          {primaryAction && (
            <Button
              type="button"
              className="h-auto w-full flex-col gap-0.5 rounded-xl bg-[#3182F6] py-3.5 text-base font-bold shadow-[0_4px_14px_-4px_rgba(49,130,246,0.55)] hover:bg-[#1b64da]"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
              <span className="text-[11px] font-normal text-blue-100">
                발주처에 즉시 전송됩니다
              </span>
            </Button>
          )}
          {secondaryAction && (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>

        <SidebarDivider className="my-6" />

        <div>
          <div className="flex items-center gap-1.5">
            <Info className="size-4 text-[#3182F6]" strokeWidth={2.5} />
            <p className="text-sm font-bold text-slate-800">법적 효력 안내</p>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            전자서명은 「전자문서 및 전자거래 기본법」 제4조에 따라 종이 문서와 동일한 법적 효력을
            가집니다.
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
            서명 시각·IP·기기 정보가 거래 기록에 함께 저장됩니다.
          </p>
        </div>
      </div>
    </aside>
  );
}
