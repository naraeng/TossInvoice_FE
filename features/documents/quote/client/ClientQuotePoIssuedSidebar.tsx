'use client';

import { Download, FileCheck2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PoIssuedStepper } from '@/features/documents/quote/shared/PoIssuedStepper';
import { PoPaymentFlowCards } from '@/features/documents/quote/shared/PoPaymentFlowCards';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
};

export function ClientQuotePoIssuedSidebar({ quote, busy }: Props) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-emerald-500" aria-hidden />

      <div className="space-y-6 p-6">
        <section>
          <div className="flex gap-3">
            <div>
              <p className="text-sm font-bold text-emerald-500">🔔 거래 상태</p>
              <p className="mt-1 text-base font-bold text-slate-900">발주서 발행 완료</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {quote.supplier.companyName}가 PO를 확인하고 서명할 예정이에요
              </p>
              <p className="mt-1 text-xs text-slate-500">(평균 1일 소요)</p>
            </div>
          </div>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <PoIssuedStepper viewerRole="CLIENT" poJustIssued />
          </div>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🔒 안전결제 흐름</p>
          <div className="mt-3">
            <PoPaymentFlowCards quote={quote} variant="client" />
          </div>
        </section>

        <Button
          variant="outline"
          className="h-11 w-full justify-center gap-2 rounded-xl border-slate-200 text-sm font-semibold text-slate-700"
          disabled={busy}
        >
          <Download className="size-4" />
          PDF 다운로드
        </Button>
      </div>
    </aside>
  );
}
