import { format } from 'date-fns';

import {
  calcPoPaymentAmounts,
  formatPaymentTimestamp,
} from '@/features/documents/quote/shared/po-payment';
import { getPoClientSignature } from '@/lib/documents/signature-utils';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function InvoicePaymentProgress({ quote }: Props) {
  const { downPaymentLabel, balanceLabel, downPaymentPercent, balancePercent } =
    calcPoPaymentAmounts(quote);
  // 실제 선금 입금 시각이 있으면 그것을, 없으면 PO 발행일로 fallback
  const downPaymentDate = quote.depositPaidAt
    ? formatPaymentTimestamp(quote.depositPaidAt)
    : format(new Date(quote.poIssuedAt ?? quote.issuedAt), 'yyyy.MM.dd');
  const clientSigner =
    getPoClientSignature(quote)?.signerName ??
    quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ??
    quote.client.companyName;

  return (
    <div className="mx-8 rounded-xl border border-[#C9D8EF] bg-[#F5F7FC] p-5 py-6">
      <p className="text-sm font-bold text-[#191919]">💳 결제 진행</p>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="rounded-full bg-emerald-500"
          style={{ width: `${downPaymentPercent}%` }}
          title={`선금 ${downPaymentPercent}%`}
        />
        <div
          className="bg-slate-200"
          style={{ width: `${balancePercent}%` }}
          title={`잔금 ${balancePercent}%`}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-bold text-emerald-500">✅ 선금 {downPaymentPercent}% · 입금 완료</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{downPaymentLabel}</p>
          <p className="mt-0.5 text-slate-500">{downPaymentDate} 결제 완료 · 보호 계좌 보관 중</p>
        </div>
        <div>
          <p className="font-bold text-[#FF9500]">⏳ 잔금 {balancePercent}% · 수령 확인 후</p>
          <p className="mt-1 text-xl font-bold text-[#3182F6]">{balanceLabel}</p>
          <p className="mt-0.5 text-slate-500">
            발주처 {clientSigner} 대표 서명 즉시 → {quote.supplier.companyName} 계좌로 자동
            송금
          </p>
        </div>
      </div>
    </div>
  );
}
