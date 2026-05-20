import {
  DEFAULT_CLIENT_PROFILE,
  DEFAULT_SUPPLIER_PROFILE,
} from '@/lib/documents/enrich-issued-quote';
import { formatKRW } from '@/lib/documents/format';
import {
  buildPaymentMethodLabel,
  resolveDownPaymentPercent,
} from '@/lib/documents/payment-terms';
import type { ReactNode } from 'react';

import type { CompanyProfile } from '@/types/documents/company';
import type { QuoteDocument } from '@/types/documents/document';

function formatAmount(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function formatRepresentative(name: string) {
  return name.includes('대표') ? name : `${name} 대표`;
}

function formatIssuedAt(iso: string) {
  if (iso.includes('T')) {
    const d = new Date(iso);
    const date = iso.slice(0, 10).replace(/-/g, '.');
    const time = d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${date} ${time}`;
  }
  return iso.replace(/-/g, '.');
}

function PartyColumn({
  label,
  companyName,
  profile,
}: {
  label: string;
  companyName: string;
  profile: CompanyProfile;
}) {
  return (
    <div className="min-w-0 flex-1 px-6 py-7">
      <p className="text-xs text-[#8E8E8E]">{label}</p>
      <p className="mt-2 text-lg font-bold leading-tight text-[#191919]">{companyName}</p>
      <div className="mt-3 text-sm leading-relaxed text-[#333333]">
        <p>{profile.businessNo}</p>
        <p>{formatRepresentative(profile.representative)}</p>
        {profile.address && <p>{profile.address}</p>}
        {profile.contact && <p>{profile.contact}</p>}
      </div>
    </div>
  );
}

type Props = {
  quote: QuoteDocument;
  trackingNumber: string;
  children?: ReactNode;
};

export function TransactionStatementDocument({ quote, trackingNumber, children }: Props) {
  const supplier = quote.supplierProfile ?? DEFAULT_SUPPLIER_PROFILE;
  const client = quote.clientProfile ?? DEFAULT_CLIENT_PROFILE;
  const invNo = quote.invoiceDocumentNo ?? 'INV-발행 전';
  const poNo = quote.poDocumentNo ?? '—';
  const issuedAt = quote.invoiceIssuedAt ?? new Date().toISOString();
  const paymentMethod =
    quote.transactionTerms?.paymentMethod ??
    buildPaymentMethodLabel(resolveDownPaymentPercent(quote));

  const metaCells = [
    { label: 'invoice 번호', value: invNo },
    { label: '발행일', value: formatIssuedAt(issuedAt) },
    { label: 'PO 참조', value: poNo },
    {
      label: '운송장',
      value: trackingNumber.trim() || '입력해주세요',
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-8 pb-2 pt-6">
        {quote.bankVerified && (
          <span className="rounded-full bg-[#EAFAEF] px-3 py-1 text-xs font-medium text-emerald-700">
            ✓ 은행 검증 거래
          </span>
        )}
        {poNo && (
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
            📄 {poNo} 기반
          </span>
        )}
        {quote.transactionToken && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#3182F6] ring-1 ring-blue-100">
            🔒 토큰 활성
          </span>
        )}
        <div className="ml-auto text-right">
          <p className="text-[10px] font-medium tracking-widest text-[#8E8E8E] uppercase">
            Transaction Statement & Delivery
          </p>
          <p className="mt-0.5 text-xl font-bold text-[#191919]">거래명세서·납품확인서</p>
        </div>
      </div>

      <div className="mx-8 flex flex-col border-t-2 border-gray-900 sm:flex-row">
        <PartyColumn
          label="발주자 (구매자)"
          companyName={quote.client.companyName}
          profile={client}
        />
        <PartyColumn
          label="수주처 (공급자)"
          companyName={quote.supplier.companyName}
          profile={supplier}
        />
      </div>

      <div className="mx-8 grid grid-cols-2 divide-x divide-[#E8E8E8] bg-[#F8F9FA] sm:grid-cols-4">
        {metaCells.map((cell) => (
          <div key={cell.label} className="px-5 py-2.5">
            <p className="text-xs text-[#8E8E8E]">{cell.label}</p>
            <p
              className={`mt-1.5 text-sm font-bold ${
                cell.label === '운송장' && !trackingNumber.trim()
                  ? 'text-slate-400'
                  : 'text-[#191919]'
              }`}
            >
              {cell.value}
            </p>
          </div>
        ))}
      </div>

      <div className="px-8 pt-2">
        <table className="w-full">
          <thead>
            <tr className="border-b border-t border-[#E8E8E8] text-xs text-[#8E8E8E]">
              <th className="w-12 py-2 text-center font-normal">NO</th>
              <th className="py-2 pr-6 text-left font-normal">품목</th>
              <th className="w-16 py-2 pr-2 text-right font-normal">수량</th>
              <th className="w-28 py-2 pr-8 text-right font-normal">단가</th>
              <th className="w-32 py-2 pr-10 text-right font-normal">합계</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => {
              const lineTotal = item.quantity * item.unitPrice;
              return (
                <tr key={item.id} className="border-b border-[#F0F0F0]">
                  <td className="py-5 text-center text-sm text-[#8E8E8E]">{index + 1}</td>
                  <td className="py-5 pr-6">
                    <p className="text-sm font-semibold text-[#191919]">{item.description}</p>
                    {item.detail && <p className="mt-1 text-xs text-[#8E8E8E]">{item.detail}</p>}
                  </td>
                  <td className="py-5 pr-4 text-right text-sm text-[#333333]">{item.quantity}</td>
                  <td className="py-5 pr-4 text-right text-sm text-[#333333]">
                    {formatAmount(item.unitPrice)}
                  </td>
                  <td className="py-5 pr-4 text-right text-sm font-bold text-[#191919]">
                    {formatAmount(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-b-2 border-[#191919]" aria-hidden />
      </div>

      <div className="px-8 py-6">
        <dl className="ml-auto w-full max-w-[300px]">
          <div className="flex justify-between gap-8 py-1.5 text-sm">
            <dt className="text-[#8E8E8E]">공급가액</dt>
            <dd className="text-[#191919]">{formatAmount(quote.totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-8 py-1.5 text-sm">
            <dt className="text-[#8E8E8E]">부가세 (10%)</dt>
            <dd className="text-[#191919]">{formatAmount(quote.totals.tax)}</dd>
          </div>
          <div className="mt-3 border-t border-slate-300/80 pt-4">
            <div className="flex items-baseline justify-between gap-8">
              <dt className="text-sm font-bold text-[#191919]">총 결제 금액</dt>
              <dd className="text-2xl font-bold text-[#3182F6]">{formatKRW(quote.totals.total)}</dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="mx-8 border-t border-slate-300/80 py-6">
        <p className="text-sm font-bold text-[#191919]">거래 조건</p>
        <dl className="mt-3 space-y-2.5 text-sm text-[#333333]">
          <div className="flex gap-4">
            <dt className="w-20 shrink-0 text-[#8E8E8E]">결제 방식</dt>
            <dd className="leading-relaxed">{paymentMethod}</dd>
          </div>
          {quote.transactionTerms?.deliverySchedule && (
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-[#8E8E8E]">납품 일정</dt>
              <dd className="font-semibold text-emerald-600">
                {quote.transactionTerms.deliverySchedule}
              </dd>
            </div>
          )}
          {quote.shippingAddress && (
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-[#8E8E8E]">배송 주소</dt>
              <dd className="leading-relaxed">{quote.shippingAddress}</dd>
            </div>
          )}
        </dl>
      </div>

      {children}
    </>
  );
}
