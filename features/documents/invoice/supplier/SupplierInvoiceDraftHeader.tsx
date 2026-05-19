import { ChevronRight } from 'lucide-react';

import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function SupplierInvoiceDraftHeader({ quote }: Props) {
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
            최종 Invoice 발행
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            PO 양측 서명이 완료되었어요! 배송 정보를 입력하고 서명하여 최종 invoice를 발행하면
            발주처(
            <span className="font-semibold text-slate-700">{quote.client.companyName}</span>
            )에 자동 전송돼요
          </p>
        </div>
      </div>
    </header>
  );
}
