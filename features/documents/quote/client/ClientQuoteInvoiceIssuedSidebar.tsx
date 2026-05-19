'use client';

import { FileDown, PenLine, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InvoiceIssuedStepper } from '@/features/documents/invoice/shared/InvoiceIssuedStepper';
import { PoPaymentFlowCards } from '@/features/documents/quote/shared/PoPaymentFlowCards';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  onConfirmReceipt?: () => void;
  onDownloadPdf?: () => void;
  onContactSupplier?: () => void;
};

export function ClientQuoteInvoiceIssuedSidebar({
  quote,
  busy,
  onConfirmReceipt,
  onDownloadPdf,
  onContactSupplier,
}: Props) {
  const invNo = quote.invoiceDocumentNo ?? 'Invoice';

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-[#3182F6]" aria-hidden />

      <div className="space-y-6 p-6">
        <section>
          <p className="text-sm font-bold text-[#3182F6]">📨 Invoice 수신</p>
          <p className="mt-1 text-base font-bold text-slate-900">{invNo} 도착</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {quote.supplier.companyName}가 invoice를 발행했어요. 물건을 확인한 뒤 수령
            확인·서명을 진행해주세요.
          </p>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <InvoiceIssuedStepper />
          </div>
        </section>

        <div className="border-t border-slate-200" />

        <section>
          <p className="text-sm font-bold text-slate-800">🔒 안전결제 흐름</p>
          <div className="mt-3">
            <PoPaymentFlowCards quote={quote} variant="client-confirmed" />
          </div>
        </section>

        <section className="space-y-2">
          <Button
            variant="outline"
            className="h-auto w-full flex-col gap-1 rounded-xl border-[#3182F6] bg-white py-3.5 text-sm font-bold text-[#3182F6] hover:bg-blue-50"
            onClick={onConfirmReceipt}
            disabled={busy}
          >
            <span className="inline-flex items-center gap-1.5">
              <PenLine className="size-4" />
              수령 확인 및 서명
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onDownloadPdf}
            disabled={busy}
          >
            <span className="inline-flex items-center gap-1.5">
              <FileDown className="size-4" />
              PDF 다운로드
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onContactSupplier}
            disabled={busy}
          >
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-4" />
              수주처에 문의
            </span>
          </Button>
        </section>
      </div>
    </aside>
  );
}
