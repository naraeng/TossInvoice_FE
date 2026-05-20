import { Check, ChevronRight } from 'lucide-react';

import { calcPoPaymentAmounts } from '@/features/documents/quote/shared/po-payment';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function ClientQuotePoConfirmedHeader({ quote }: Props) {
  const poNo = quote.poDocumentNo ?? 'PO-발행';
  const { downPaymentLabel } = calcPoPaymentAmounts(quote);

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>거래</span>
            <ChevronRight className="size-3.5" />
            <span>발주서</span>
            <ChevronRight className="size-3.5" />
            <span className="text-slate-700">{poNo}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            확정 PO
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            발주서를 발행했고, 수주처(
            <span className="font-semibold text-slate-700">{quote.supplier.companyName}</span>
            ) 서명까지 완료되어 선금(
            <span className="font-semibold text-slate-700">{downPaymentLabel}</span>
            )이 보호계좌로 예치되었습니다. 최종 invoice 발급을 기다려주세요.
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <Check className="size-3.5" strokeWidth={3} />
          양측 서명 완료 · 선금 예치됨
        </span>
      </div>
    </header>
  );
}
