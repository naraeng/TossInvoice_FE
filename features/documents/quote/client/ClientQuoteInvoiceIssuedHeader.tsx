import { ChevronRight } from 'lucide-react';

import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function ClientQuoteInvoiceIssuedHeader({ quote }: Props) {
  const invNo = quote.invoiceDocumentNo ?? 'INV-발행';

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>거래</span>
            <ChevronRight className="size-3.5" />
            <span>최종 invoice</span>
            <ChevronRight className="size-3.5" />
            <span className="text-slate-700">{invNo}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            인보이스 수신
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            수주처(
            <span className="font-semibold text-slate-700">{quote.supplier.companyName}</span>
            )가 최종 invoice를 발행했어요. 물건 수령 후 본인 확인·서명을 진행하면 잔금이
            정산됩니다.
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
          📨 invoice 도착 · 수령 확인 대기
        </span>
      </div>
    </header>
  );
}
