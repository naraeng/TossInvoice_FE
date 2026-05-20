'use client';

import { PenLine, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PoIssuedStepper } from '@/features/documents/quote/shared/PoIssuedStepper';
import { PoPaymentFlowCards } from '@/features/documents/quote/shared/PoPaymentFlowCards';
import { calcPoPaymentAmounts } from '@/features/documents/quote/shared/po-payment';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  canSign?: boolean;
  onSignPo?: () => void;
  onReject?: () => void;
};

export function SupplierQuotePoIssuedSidebar({ quote, busy, canSign, onSignPo, onReject }: Props) {
  const rep = quote.supplierProfile?.representative ?? `${quote.supplier.companyName ?? ''} 대표`.trim();
  const { downPaymentLabel } = calcPoPaymentAmounts(quote);

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-emerald-500" aria-hidden />

      <div className="space-y-6 p-6">
        <section>
          <div className="flex gap-3">
            <div>
              <p className="text-sm font-bold text-emerald-500">📨 PO 도착</p>
              <p className="mt-1 text-base font-bold text-slate-900">발주서가 도착했어요</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {quote.client.companyName}가 PO를 보냈어요! 본인 확인+서명만 남았어요
              </p>
            </div>
          </div>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <PoIssuedStepper viewerRole="SUPPLIER" />
          </div>
        </section>

        <div className="border-t border-slate-200"></div>

        <section>
          <p className="text-sm font-bold text-slate-800">🔒 안전결제 흐름</p>
          <div className="mt-3">
            <PoPaymentFlowCards quote={quote} variant="supplier" />
          </div>
        </section>

        <div className="border-t border-slate-200"></div>

        <div>
          <p className="text-sm font-bold text-slate-800">📋 다음 단계</p>
          <div className="mt-4 rounded-xl bg-[#FFFBEB] px-3.5 py-3">
            <p className="mt-1 text-sm font-bold leading-relaxed text-amber-500">
              ✍️ 본인({rep}) 확인 + 서명
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              서명하면 선금 {downPaymentLabel}이 보호 계좌로 입금되고, 최종 invoice 단계로
              넘어갑니다
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <Button
            variant="outline"
            className="h-auto w-full flex-col gap-1 rounded-xl border-[#3182F6] bg-white py-3.5 text-sm font-bold text-[#3182F6] hover:bg-blue-50"
            onClick={onSignPo}
            disabled={busy || !canSign}
          >
            <span className="inline-flex items-center gap-1.5">✍️ 서명 확정 / 선금 입금받기</span>
          </Button>
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-[11px] font-medium text-emerald-800">
            💰 확정하면 선금 {downPaymentLabel}이 보호 계좌로 입금돼요
          </p>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-rose-200 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            onClick={onReject}
            disabled={busy}
          >
            🚫 반려/수정 요청
          </Button>
        </section>
      </div>
    </aside>
  );
}
