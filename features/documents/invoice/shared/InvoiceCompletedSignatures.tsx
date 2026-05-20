import { Check } from 'lucide-react';

import { SignatureVisual } from '@/features/documents/quote/shared/SignatureVisual';
import {
  getInvoiceClientSignature,
  getInvoiceSupplierSignature,
} from '@/lib/documents/signature-utils';
import type { QuoteDocument } from '@/types/documents/document';

function formatSignedAt(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

function formatRepresentative(name: string) {
  return name.includes('대표') ? name : `${name} 대표`;
}

type Props = {
  quote: QuoteDocument;
};

export function InvoiceCompletedSignatures({ quote }: Props) {
  const supplierSig = getInvoiceSupplierSignature(quote);
  const clientSig = getInvoiceClientSignature(quote);
  const supplierRep =
    quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ??
    quote.supplier.companyName ??
    '';
  const clientRep =
    quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ??
    quote.client.companyName ??
    '';

  return (
    <section className="mx-8 border-t border-slate-300/80 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#191919]">서명</p>
          <p className="mt-1 text-xs text-[#8E8E8E]">양측 서명 일치 · 거래 마무리 완료</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
          <Check className="size-3.5" strokeWidth={3} />
          양측 서명 완료
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
          <p className="text-xs font-semibold text-slate-500">수주처 (공급자) 서명</p>
          <p className="mt-0.5 text-[10px] text-emerald-600">Invoice 발행 시 서명 완료</p>
          <p className="mt-2 text-sm font-bold text-slate-900">{quote.supplier.companyName}</p>
          <p className="text-xs text-slate-500">{formatRepresentative(supplierRep)}</p>
          <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-lg bg-white px-4 py-6">
            <SignatureVisual signature={supplierSig} fallbackName={supplierRep} />
          </div>
          {supplierSig && (
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              서명 일시: {formatSignedAt(supplierSig.signedAt)}
              {supplierSig.ipAddress && ` · IP ${supplierSig.ipAddress}`}
              <br />
              인증서: 공동인증서 (사업자)
            </p>
          )}
          <p className="mt-2 text-[11px] font-semibold text-emerald-600">✓ 무결성 검증 완료</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
          <p className="text-xs font-semibold text-slate-500">발주자 (구매자) 최종 서명</p>
          <p className="mt-0.5 text-[10px] text-emerald-600">대표자 본인 서명 · 물건 도착 확인</p>
          <p className="mt-2 text-sm font-bold text-slate-900">{quote.client.companyName}</p>
          <p className="text-xs text-slate-500">{formatRepresentative(clientRep)}</p>
          <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-lg bg-white px-4 py-6">
            <SignatureVisual signature={clientSig} fallbackName={clientRep} />
          </div>
          {clientSig && (
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              서명 일시: {formatSignedAt(clientSig.signedAt)}
              {clientSig.ipAddress && ` · IP ${clientSig.ipAddress}`}
              <br />
              인증서: 공동인증서 (사업자)
            </p>
          )}
          <p className="mt-2 text-[11px] font-semibold text-emerald-600">✓ 무결성 검증 완료</p>
        </div>
      </div>
    </section>
  );
}
