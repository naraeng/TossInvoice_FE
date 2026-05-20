import { SignatureVisual } from '@/features/documents/quote/shared/SignatureVisual';
import {
  DEFAULT_CLIENT_PROFILE,
  DEFAULT_SUPPLIER_PROFILE,
} from '@/lib/documents/enrich-issued-quote';
import { formatKRW } from '@/lib/documents/format';
import {
  buildPaymentMethodLabel,
  formatPaymentTerms,
  resolveDownPaymentPercent,
} from '@/lib/documents/payment-terms';
import { getPiSupplierSignature } from '@/lib/documents/signature-utils';
import type { CompanyProfile } from '@/types/documents/company';
import type { QuoteDocument } from '@/types/documents/document';

function formatDisplayDate(iso: string) {
  return iso.replace(/-/g, '.');
}

function formatAmount(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function formatRepresentative(name: string) {
  return name.includes('대표') ? name : `${name} 대표`;
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
};

export function ProformaInvoiceDocument({ quote }: Props) {
  const supplier = quote.supplierProfile ?? DEFAULT_SUPPLIER_PROFILE;
  const client = quote.clientProfile ?? DEFAULT_CLIENT_PROFILE;
  const supplierSignature = getPiSupplierSignature(quote);
  const downPaymentPercent = resolveDownPaymentPercent(quote);
  const paymentTerms = quote.paymentTerms ?? formatPaymentTerms(downPaymentPercent);
  const validity = quote.validityUntil
    ? `${formatDisplayDate(quote.validityUntil)}까지`
    : '유효기간 미정';
  const paymentMethod =
    quote.transactionTerms?.paymentMethod ?? buildPaymentMethodLabel(downPaymentPercent);
  const deliverySchedule =
    quote.transactionTerms?.deliverySchedule ?? '2026.05.25 (월) — 결제 후 7일 이내';

  const metaCells = [
    { label: '견적번호', value: quote.documentNo },
    { label: '발행일', value: formatDisplayDate(quote.issuedAt) },
    { label: '유효기간', value: validity },
    { label: '결제조건', value: paymentTerms },
  ];

  return (
    <article className="overflow-hidden border border-slate-200 bg-white shadow-[0_8px_32px_-20px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between gap-4 px-10 pb-2 pt-6">
        {/* 발주처 위험도 배지: clientStatus 원본을 우선, 없으면 bankVerified로 fallback */}
        {(() => {
          const status =
            quote.clientStatus ??
            (quote.bankVerified === true ? '정상' : quote.bankVerified === false ? undefined : undefined);
          if (status === '정상') {
            return (
              <span className="rounded-full bg-[#EAFAEF] px-3 py-1 text-xs font-medium text-emerald-600">
                ✓ 검증 거래
              </span>
            );
          }
          if (status === '주의') {
            return (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                ⚠ 주의 거래처
              </span>
            );
          }
          if (status === '위험') {
            return (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                🚨 위험 거래처
              </span>
            );
          }
          return <span />;
        })()}
        <div className="text-right">
          <p className="text-[10px] font-medium tracking-widest text-[#8E8E8E] uppercase">
            Proforma Invoice
          </p>
          <p className="mt-0.5 text-xl font-bold text-[#191919]">견적서 (PI)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row mx-8 border-t-2 border-gray-900">
        <PartyColumn
          label="공급자 (수주처)"
          companyName={quote.supplier.companyName}
          profile={supplier}
        />
        <PartyColumn
          label="수신자 (발주처)"
          companyName={quote.client.companyName}
          profile={client}
        />
      </div>

      <div className="grid grid-cols-2 divide-x divide-[#E8E8E8] bg-[#F8F9FA] sm:grid-cols-4 mx-8">
        {metaCells.map((cell) => (
          <div key={cell.label} className="px-5 py-2.5">
            <p className="text-xs text-[#8E8E8E]">{cell.label}</p>
            <p className="mt-1.5 text-sm font-bold text-[#191919]">{cell.value}</p>
          </div>
        ))}
      </div>

      <div className="px-8 pt-2">
        <table className="w-full">
          <thead>
            <tr className="text-xs border-t border-b border-[#E8E8E8] text-[#8E8E8E]">
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
                  <td className="py-5 text-center align-top text-sm text-[#8E8E8E]">{index + 1}</td>
                  <td className="py-5 pr-6 align-top">
                    <p className="text-sm font-semibold text-[#191919]">{item.description}</p>
                    {item.detail && <p className="mt-1 text-xs text-[#8E8E8E]">{item.detail}</p>}
                  </td>
                  <td className="py-5 text-right pr-4 not-last-of-type:align-top text-sm text-[#333333]">
                    {item.quantity}
                  </td>
                  <td className="py-5 text-right pr-4 align-top text-sm text-[#333333]">
                    {formatAmount(item.unitPrice)}
                  </td>
                  <td className="py-5 text-right pr-4 align-top text-sm font-bold text-[#191919]">
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
            <dd className="tabular-nums text-[#191919]">{formatAmount(quote.totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-8 py-1.5 text-sm">
            <dt className="text-[#8E8E8E]">부가세 (10%)</dt>
            <dd className="tabular-nums text-[#191919]">{formatAmount(quote.totals.tax)}</dd>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-4">
            <div className="flex items-baseline justify-between gap-8">
              <dt className="text-sm font-bold text-[#191919]">총 결제 금액</dt>
              <dd className="text-2xl font-bold tabular-nums text-[#3182F6]">
                {formatKRW(quote.totals.total)}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="border-t border-[#F0F0F0] px-8 py-6">
        <p className="text-sm font-bold text-[#191919]">거래 조건</p>
        <dl className="mt-3 space-y-2.5 text-sm text-[#333333]">
          <div className="flex gap-4">
            <dt className="w-16 shrink-0 text-[#8E8E8E]">결제 방식</dt>
            <dd className="leading-relaxed">{paymentMethod}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-16 shrink-0 text-[#8E8E8E]">납기 일정</dt>
            <dd>{deliverySchedule}</dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-[#F0F0F0] px-8 py-6">
        <p className="text-sm font-bold text-[#191919]">서명</p>
        <p className="mt-1 text-xs text-[#8E8E8E]">
          전자서명법에 따라 본 문서의 서명은 법적 효력을 가집니다.
        </p>
        <div className="mt-4 rounded-lg bg-[#F8F9FA] px-6 py-6">
          <p className="text-xs text-[#8E8E8E]">{quote.supplier.companyName}</p>
          <p className="mt-1 text-sm font-semibold text-[#191919]">
            {supplierSignature?.signerName ?? supplier.representative.replace(/\s*대표\s*$/, '')}
          </p>
          <div className="mt-4 flex min-h-28 items-center justify-center rounded-lg bg-white px-4 py-6">
            <SignatureVisual
              signature={supplierSignature}
              fallbackName={supplier.representative.replace(/\s*대표\s*$/, '')}
              className="max-h-32 w-auto max-w-full object-contain"
            />
          </div>
          {supplierSignature && (
            <p className="mt-4 text-[10px] text-[#8E8E8E]">
              서명 일시: {new Date(supplierSignature.signedAt).toLocaleString('ko-KR')}
              {supplierSignature.ipAddress && ` · IP ${supplierSignature.ipAddress}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F0F0F0] px-8 py-3 text-[10px] text-[#8E8E8E]">
        <p>본 문서는 안전결제 플랫폼을 통해 발행되었습니다.</p>
        <p>Page 1 of 1</p>
      </div>
    </article>
  );
}
