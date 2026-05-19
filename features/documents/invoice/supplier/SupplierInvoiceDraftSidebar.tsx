'use client';

import { Check, FileDown, MessageCircle, PenLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InvoiceDraftStepper } from '@/features/documents/invoice/shared/InvoiceDraftStepper';
import { calcPoPaymentAmounts } from '@/features/documents/quote/shared/po-payment';
import type { QuoteDocument } from '@/types/documents/document';

const CHECKLIST = [
  'PO 양측 서명 일치',
  '선금 보호 계좌 입금 확인',
  '품목·금액 PI 일치',
  '보안 토큰 활성',
];

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  canIssue?: boolean;
  onIssueInvoice?: () => void;
  onDownloadPdf?: () => void;
  onContactClient?: () => void;
};

export function SupplierInvoiceDraftSidebar({
  quote,
  busy,
  canIssue,
  onIssueInvoice,
  onDownloadPdf,
  onContactClient,
}: Props) {
  const { downPaymentLabel } = calcPoPaymentAmounts(quote.totals);
  const issuedLabel = quote.invoiceIssuedAt
    ? new Date(quote.invoiceIssuedAt).toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-[#FF9500]" aria-hidden />

      <div className="space-y-6 p-6">
        <section className="py-3">
          <p className="mb-1 text-sm font-bold text-[#FF9500]">🌟 최종 Invoice 발행 단계</p>
          <p className="text-lg font-bold text-slate-800">PO 양측 서명 완료</p>
          <p className="text-lg font-bold leading-relaxed text-[#3182F6]">
            본인 서명으로 발행만 남았어요!
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            발행하면 발주처에 자동 전송되고 물건 발송 + 추적이 시작돼요
          </p>
          <div className="rounded-lg bg-[#F8F9FA] px-3 py-2.5 mt-4">
            <p className="mt-2 text-[11px] text-slate-500">🏪 발주처 (수신)</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{quote.client.companyName}</p>
            <p className="mt-1 text-[11px] text-slate-500">작성: {issuedLabel}</p>
          </div>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">✅ 발행 전 사전 검증 완료</p>
          <ul className="mt-3 space-y-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" strokeWidth={3} />
                <span>
                  {item.includes('선금') ? (
                    <>
                      {item} ({downPaymentLabel})
                    </>
                  ) : (
                    item
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="border-t border-slate-200"></div>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <InvoiceDraftStepper />
          </div>
        </section>

        <section className="space-y-2">
          <Button
            className="h-auto w-full rounded-xl bg-[#3182F6] py-3.5 text-sm font-bold text-white hover:bg-[#1b64da]"
            onClick={onIssueInvoice}
            disabled={busy || !canIssue}
          >
            <span className="inline-flex items-center gap-1.5">
              <PenLine className="size-4" />
              인보이스 발행
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-slate-200 text-sm font-semibold text-slate-700"
            onClick={onDownloadPdf}
            disabled={busy}
          >
            <span className="inline-flex items-center gap-1.5">
              <FileDown className="size-4" />
              PDF 다운로드
            </span>
          </Button>
          <Button
            variant="ghost"
            className="h-10 w-full text-sm font-medium text-slate-500"
            onClick={onContactClient}
            disabled={busy}
          >
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-4" />
              발주처에 문의
            </span>
          </Button>
        </section>

        <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
          📌 발행 후 발주처에 invoice 자동 전송 → 운송장 추적 시작 → 수령 확인 시 잔금 자동 송금 →
          거래 완료 후 양측 보관용 invoice 생성
        </p>
      </div>
    </aside>
  );
}
