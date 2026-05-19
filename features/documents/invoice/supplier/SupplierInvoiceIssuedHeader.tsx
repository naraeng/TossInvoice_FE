import { ChevronRight } from 'lucide-react';

import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function SupplierInvoiceIssuedHeader({ quote }: Props) {
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
            Invoice 발행 완료
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            {invNo}가 발주처(
            <span className="font-semibold text-slate-700">{quote.client.companyName}</span>
            )에 전송되었습니다. 발주처의 수령 확인·서명을 기다려 주세요.
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          ✓ 발행 완료 · 배송 중
        </span>
      </div>
    </header>
  );
}
