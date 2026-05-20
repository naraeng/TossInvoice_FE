'use client';

import { FileDown, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InvoiceCompletedStepper } from '@/features/documents/invoice/shared/InvoiceCompletedStepper';
import { calcPoPaymentAmounts } from '@/features/documents/quote/shared/po-payment';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  contactLabel?: string;
  onDownloadPdf?: () => void;
  onContact?: () => void;
  onBackToTrade?: () => void;
};

/** 거래 완료 후 양측(수주처·발주처) 동일 사이드바 */
export function InvoiceCompletedSidebar({
  quote,
  busy,
  contactLabel = '상대방에 문의',
  onDownloadPdf,
  onContact,
  onBackToTrade,
}: Props) {
  const invNo = quote.invoiceDocumentNo ?? 'Invoice';
  const { balanceLabel } = calcPoPaymentAmounts(quote);
  const completedAt = quote.balancePaidAt
    ? new Date(quote.balancePaidAt).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-emerald-500" aria-hidden />

      <div className="space-y-6 p-6">
        <section>
          <p className="text-sm font-bold text-emerald-600">✓ 거래 완료</p>
          <p className="mt-1 text-base font-bold text-slate-900">{invNo}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            양측 서명·잔금 송금이 완료되었습니다. 보관용 invoice가 생성되었습니다.
          </p>
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100">
            <p className="text-[11px] font-medium text-emerald-800">💰 잔금 송금 완료</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{balanceLabel}</p>
            {completedAt && (
              <p className="mt-1 text-[11px] text-emerald-700">완료 시각: {completedAt}</p>
            )}
          </div>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <InvoiceCompletedStepper />
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
            onClick={onContact}
            disabled={busy}
          >
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-4" />
              {contactLabel}
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
