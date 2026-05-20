import { Check, ChevronRight } from 'lucide-react';

import { resolveDownPaymentPercent } from '@/lib/documents/payment-terms';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function ClientQuotePoIssuedHeader({ quote }: Props) {
  const poNo = quote.poDocumentNo ?? 'PO-발행';
  const downPaymentPercent = resolveDownPaymentPercent(quote);

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
            발주서 발행 완료
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
            수주처(
            <span className="font-semibold text-slate-700">{quote.supplier.companyName}</span>
            )에 발주서가 전송되었어요
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            수주처가 확인 후 서명하면 선금({downPaymentPercent}%)이 안전결제로 처리되고, 최종 invoice 발급 단계로
            넘어가요
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <Check className="size-3.5" strokeWidth={3} />
          발행 완료 · 수주처 확인 대기
        </span>
      </div>
    </header>
  );
}
