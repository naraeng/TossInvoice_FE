import { ChevronRight } from 'lucide-react';

import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function InvoiceCompletedHeader({ quote }: Props) {
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
            최종 invoice · 거래 완료
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            양측 서명·결제가 완료된 거래명세서·납품확인서입니다. 보관용으로 언제든지 조회할 수
            있습니다.
          </p>
        </div>
      </div>
    </header>
  );
}
