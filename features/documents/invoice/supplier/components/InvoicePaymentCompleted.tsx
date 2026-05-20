import {
  calcPoPaymentAmounts,
  formatBalanceTransferLabel,
  formatPaymentTimestamp,
} from '@/features/documents/quote/shared/po-payment';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function InvoicePaymentCompleted({ quote }: Props) {
  const { downPaymentLabel, balanceLabel, downPaymentPercent, balancePercent } =
    calcPoPaymentAmounts(quote);
  const depositAt = formatPaymentTimestamp(
    quote.depositPaidAt ?? quote.poIssuedAt ?? quote.issuedAt,
  );
  const balanceAt = formatPaymentTimestamp(quote.balancePaidAt ?? quote.arrivalConfirmedAt);
  const transferLabel = formatBalanceTransferLabel(quote);

  return (
    <div className="mx-8 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 py-6">
      <p className="text-sm font-bold text-[#191919]">💳 결제 완료 · 안전결제 정산 종료</p>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="w-full rounded-full bg-emerald-500" title="결제 100%" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
        <div>
          <p className="font-bold text-emerald-600">✅ 선금 {downPaymentPercent}%</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{downPaymentLabel}</p>
          <p className="mt-0.5 leading-relaxed text-slate-600">
            {depositAt ? `${depositAt} 결제 완료` : '결제 완료'} · 보호 계좌 정산 완료
          </p>
        </div>
        <div>
          <p className="font-bold text-emerald-600">✅ 잔금 {balancePercent}%</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{balanceLabel}</p>
          <p className="mt-0.5 leading-relaxed text-slate-600">
            {balanceAt ? `${balanceAt} 송금 완료` : '송금 완료'}
            {transferLabel ? ` · ${transferLabel}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
