'use client';

import { Check, FileDown, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InvoiceIssuedStepper } from '@/features/documents/invoice/shared/InvoiceIssuedStepper';
import {
  calcPoPaymentAmounts,
  formatSupplierBankDisplay,
} from '@/features/documents/quote/shared/po-payment';
import type { QuoteDocument } from '@/types/documents/document';

const DELIVERY_CHECKS = [
  '운송장 번호 등록 완료',
  '배송 추적 활성',
  '수주처 invoice 서명 일치',
  'PO·invoice 금액 일치',
  '보안 토큰 활성',
];

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  canConfirm?: boolean;
  onConfirmReceipt?: () => void;
  onReportIssue?: () => void;
  onDownloadPdf?: () => void;
  onContactSupplier?: () => void;
};

export function ClientQuoteInvoiceIssuedSidebar({
  quote,
  busy,
  canConfirm,
  onConfirmReceipt,
  onReportIssue,
  onDownloadPdf,
  onContactSupplier,
}: Props) {
  const { balanceLabel } = calcPoPaymentAmounts(quote.totals);
  const { bankLine, holder } = formatSupplierBankDisplay(quote);
  const invNo = quote.invoiceDocumentNo ?? 'Invoice';

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-[#3182F6]" aria-hidden />

      <div className="space-y-6 p-6">
        <section>
          <p className="text-sm font-bold text-[#3182F6]">📦 물건 도착</p>
          <p className="mt-1 text-base font-bold leading-snug text-slate-900">
            물건이 도착했어요.
            <br />
            수령 확인 + 최종 서명만 남았어요!
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {quote.supplier.companyName}가 발행한 {invNo}를 확인한 뒤 서명해 주세요.
          </p>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">✅ 납품 자동 검증 완료</p>
          <ul className="mt-3 space-y-2">
            {DELIVERY_CHECKS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" strokeWidth={3} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="border-t border-slate-200" />

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <InvoiceIssuedStepper />
          </div>
        </section>

        <div className="rounded-xl bg-blue-50 px-4 py-3.5 ring-1 ring-blue-100">
          <p className="text-[11px] font-medium text-blue-800">💳 서명 즉시 잔금 자동 송금</p>
          <p className="mt-1 text-xl font-bold text-[#3182F6]">{balanceLabel}</p>
          {bankLine ? (
            <div className="mt-3 rounded-lg border border-blue-100 bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-500">입금 계좌 (수주처)</p>
              <p className="mt-1 text-sm font-bold leading-snug text-slate-900">{bankLine}</p>
              <p className="mt-1 text-[11px] text-slate-600">예금주: {holder}</p>
            </div>
          ) : (
            <p className="mt-2 text-[11px] leading-relaxed text-blue-700">
              최종 서명 즉시 {quote.supplier.companyName} 계좌로 송금됩니다.
            </p>
          )}
          {bankLine ? (
            <p className="mt-2 text-[11px] leading-relaxed text-blue-700">
              서명 완료 시 위 계좌로 잔금이 자동 송금됩니다.
            </p>
          ) : null}
        </div>

        <section className="space-y-2">
          <Button
            type="button"
            className="h-auto w-full flex-col gap-1 rounded-xl bg-[#3182F6] py-3.5 font-bold text-white hover:bg-[#1b64da] disabled:opacity-60"
            onClick={onConfirmReceipt}
            disabled={busy || !canConfirm}
          >
            {busy ? '처리 중…' : '최종 서명'}
            <p className="text-[10px] font-medium text-white">
              {busy ? '잔금 송금 처리 중' : '거래 완료 · 잔금 즉시 송금'}
            </p>
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-rose-200 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            onClick={onReportIssue}
            disabled={busy}
          >
            🚨 물건 미도착 · 문제 신고
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
