'use client';

import { FileDown, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SupplierInvoiceIssuedStepper } from '@/features/documents/invoice/shared/SupplierInvoiceIssuedStepper';
import { PoPaymentFlowCards } from '@/features/documents/quote/shared/PoPaymentFlowCards';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  onDownloadPdf?: () => void;
  onContactClient?: () => void;
  onBackToTrade?: () => void;
};

export function SupplierInvoiceIssuedSidebar({
  quote,
  busy,
  onDownloadPdf,
  onContactClient,
  onBackToTrade,
}: Props) {
  const invNo = quote.invoiceDocumentNo ?? 'Invoice';
  const issuedLabel = quote.invoiceIssuedAt
    ? new Date(quote.invoiceIssuedAt).toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-emerald-500" aria-hidden />

      <div className="space-y-6 p-6">
        <section>
          <p className="text-sm font-bold text-emerald-600">✓ Invoice 발행 완료</p>
          <p className="mt-1 text-base font-bold text-slate-900">{invNo}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            인보이스가 발행되었고, 발주처{' '}
            <span className="font-semibold text-slate-700">{quote.client.companyName}</span>에
            전송되었습니다.
          </p>
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100">
            <p className="text-[11px] font-medium text-emerald-800">📤 발주처 전송 완료</p>
            <p className="mt-1 text-[11px] text-emerald-700">
              발행 시각: {issuedLabel}
              <br />
              운송장 추적이 시작되었습니다. 수령 확인 후 잔금이 정산됩니다.
            </p>
          </div>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <SupplierInvoiceIssuedStepper />
          </div>
        </section>

        <div className="border-t border-slate-200" />

        <section>
          <p className="text-sm font-bold text-slate-800">🔒 안전결제 흐름</p>
          <div className="mt-3">
            <PoPaymentFlowCards quote={quote} variant="supplier-confirmed" />
          </div>
        </section>

        <section className="space-y-2">
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
            onClick={onContactClient}
            disabled={busy}
          >
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-4" />
              발주처에 문의
            </span>
          </Button>
          {onBackToTrade && (
            <Button
              variant="ghost"
              className="h-10 w-full text-sm font-medium text-slate-500"
              onClick={onBackToTrade}
              disabled={busy}
            >
              거래 목록으로
            </Button>
          )}
        </section>
      </div>
    </aside>
  );
}
