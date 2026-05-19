'use client';

import { FileDown, PenLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PoIssuedStepper } from '@/features/documents/quote/shared/PoIssuedStepper';
import { PoPaymentFlowCards } from '@/features/documents/quote/shared/PoPaymentFlowCards';
import { calcPoPaymentAmounts } from '@/features/documents/quote/shared/po-payment';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  onCreateInvoice?: () => void;
  onDownloadPdf?: () => void;
};

export function SupplierQuotePoConfirmedSidebar({
  quote,
  busy,
  onCreateInvoice,
  onDownloadPdf,
}: Props) {
  const { downPaymentLabel } = calcPoPaymentAmounts(quote.totals);

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-emerald-500" aria-hidden />

      <div className="space-y-6 p-6">
        <section>
          <p className="text-sm font-bold text-emerald-600">✓ PO 확정</p>
          <p className="mt-1 text-base font-bold text-slate-900">양측 서명이 완료됐어요</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            선금 {downPaymentLabel}이 보호 계좌로 입금됐습니다. 최종 invoice를 작성해주세요.
          </p>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <PoIssuedStepper viewerRole="SUPPLIER" poConfirmed />
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
            className="h-auto w-full flex-col gap-1 rounded-xl border-[#3182F6] bg-white py-3.5 text-sm font-bold text-[#3182F6] hover:bg-blue-500 hover:text-white"
            onClick={onCreateInvoice}
            disabled={busy}
          >
            <span className="inline-flex items-center gap-1.5">✍️ 인보이스 작성하기</span>
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
        </section>
      </div>
    </aside>
  );
}
