import { Coins, Vault } from 'lucide-react';

import { calcPoPaymentAmounts } from '@/features/documents/quote/shared/po-payment';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  variant?: 'client' | 'client-confirmed' | 'supplier' | 'supplier-confirmed';
};

export function PoPaymentFlowCards({ quote, variant = 'client' }: Props) {
  const { downPaymentLabel, balanceLabel, downPaymentPercent, balancePercent } =
    calcPoPaymentAmounts(quote);
  const downPaymentHint =
    variant === 'supplier-confirmed'
      ? '보호 계좌 입금 완료'
      : variant === 'client-confirmed'
        ? '본인 서명 즉시 보호 계좌로 입금'
        : variant === 'supplier'
          ? '서명 확정 시 보호 계좌로 입금'
          : '수주처 서명 시 자동 송금';

  return (
    <div className="flex flex-col gap-3">
      <div
        className={
          variant === 'supplier-confirmed'
            ? 'rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3'
            : 'rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3'
        }
      >
        <div className="flex items-center gap-2">
          <Coins
            className={
              variant === 'supplier-confirmed' ? 'size-4 text-emerald-600' : 'size-4 text-amber-600'
            }
          />
          <p className="text-xs font-bold text-slate-800">선금 ({downPaymentPercent}%)</p>
          <p className="ml-2 text-lg font-bold text-slate-900">{downPaymentLabel}</p>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">{downPaymentHint}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Vault className="size-4 text-slate-500" />
          <p className="text-xs font-bold text-slate-800">잔금 ({balancePercent}%)</p>
          <p className="ml-2 text-lg font-bold text-slate-900">{balanceLabel}</p>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          {variant === 'client-confirmed' ? '납품 확인 후 자동 송금 예정' : '납품 확인 후 자동 송금'}
        </p>
      </div>
    </div>
  );
}
