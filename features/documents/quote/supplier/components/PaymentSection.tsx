'use client';

import { Shield } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { formatKRW } from '@/lib/documents/format';
import { calcPaymentSplit, clampDownPaymentPercent } from '@/lib/documents/payment-terms';
import { cn } from '@/lib/utils';
import type { Totals } from '@/types/documents/document';

import { SectionCard, SectionTitle } from './SectionCard';

type Props = {
  totals: Totals;
  downPaymentPercent: number;
  onDownPaymentPercentChange: (percent: number) => void;
};

const columnBase = 'space-y-1 px-5 py-4 sm:px-6';

const columnWithDivider =
  "relative sm:before:absolute sm:before:left-0 sm:before:top-1/2 sm:before:h-12 sm:before:w-px sm:before:-translate-y-1/2 sm:before:bg-slate-200 sm:before:content-['']";

function parsePercentInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  return clampDownPaymentPercent(Number(digits));
}

function formatPercentInput(percent: number) {
  return percent > 0 ? String(percent) : '';
}

export function PaymentSection({ totals, downPaymentPercent, onDownPaymentPercentChange }: Props) {
  const { balancePercent, downPayment, balance } = calcPaymentSplit(totals, downPaymentPercent);

  return (
    <SectionCard>
      <SectionTitle
        title="결제 조건"
        badge={
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F2FF] px-2.5 py-0.5 text-[10px] font-bold text-[#3182F6]">
            <Shield className="size-3" aria-hidden />
            안전결제
          </span>
        }
      />
      <div className="mb-4 overflow-hidden rounded-xl bg-[#F8F9FA]">
        <div className="grid sm:grid-cols-3">
          <div className={columnBase}>
            <p className="text-xs font-medium text-slate-400">선금 비율</p>
            <div className="flex items-baseline gap-1">
              <Input
                type="text"
                inputMode="numeric"
                value={formatPercentInput(downPaymentPercent)}
                onChange={(e) => onDownPaymentPercentChange(parsePercentInput(e.target.value))}
                placeholder="30"
                className="h-10 w-20 rounded-lg border-slate-200 bg-white px-2 text-3xl font-bold text-[#3182F6] tabular-nums focus-visible:ring-blue-200"
                aria-label="선금 비율"
              />
              <span className="text-2xl font-bold text-[#3182F6]">%</span>
            </div>
            <p className="text-xs text-slate-600">= {formatKRW(downPayment)} (PO 합의 후)</p>
          </div>

          <div
            className={cn(columnBase, columnWithDivider, 'border-t border-slate-200 sm:border-t-0')}
          >
            <p className="text-xs font-medium text-slate-400">잔금 비율</p>
            <p className="text-2xl font-bold tracking-tight text-[#8B5CF6]">{balancePercent}%</p>
            <p className="text-xs text-slate-600">= {formatKRW(balance)} (납품 확인 후)</p>
          </div>

          <div
            className={cn(columnBase, columnWithDivider, 'border-t border-slate-200 sm:border-t-0')}
          >
            <p className="text-xs font-medium text-slate-400">총 결제 금액</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">
              {formatKRW(totals.total)}
            </p>
            <p className="text-xs text-slate-400">VAT 포함</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
