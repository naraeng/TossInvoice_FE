'use client';

import { FileDown, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PoIssuedStepper } from '@/features/documents/quote/shared/PoIssuedStepper';
import { PoPaymentFlowCards } from '@/features/documents/quote/shared/PoPaymentFlowCards';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  onDownloadPdf?: () => void;
  onContactSupplier?: () => void;
};

export function ClientQuotePoConfirmedSidebar({
  quote,
  busy,
  onDownloadPdf,
  onContactSupplier,
}: Props) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-emerald-500" aria-hidden />

      <div className="space-y-6 p-6">
        <section>
          <p className="text-sm font-bold text-emerald-600">✓ 거래 성사</p>
          <p className="mt-1 text-base font-bold text-slate-900">거래가 성사되었어요</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            PO가 확정되었고 선금이 보호 계좌에 예치되었습니다. 수주처가 최종 invoice를
            발행할 예정이에요.
          </p>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <PoIssuedStepper viewerRole="CLIENT" poConfirmed />
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
