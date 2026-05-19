import { Check } from 'lucide-react';

import { SignatureVisual } from '@/features/documents/quote/shared/SignatureVisual';
import { getPoSupplierSignature } from '@/lib/documents/signature-utils';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function InvoiceSignatureSection({ quote }: Props) {
  const supplierSig = getPoSupplierSignature(quote);
  const supplierRep =
    quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규';
  const clientRep =
    quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ?? '김민수';

  return (
    <section className="mx-8 border-t border-slate-300/80 py-6">
      <p className="text-sm font-bold text-[#191919]">서명</p>
      <p className="mt-1 text-xs text-[#8E8E8E]">
        invoice 발행 시 수주처 서명이 자동 적용되며, 발주처는 수령 확인 후 최종 서명합니다.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
          <p className="text-xs font-semibold text-slate-500">수주처 (공급자) 서명</p>
          <p className="mt-0.5 text-[10px] text-slate-400">발행 시 자동 적용</p>
          <p className="mt-2 text-sm font-bold text-slate-900">{quote.supplier.companyName}</p>
          <div className="mt-4 flex min-h-[100px] items-center justify-center rounded-lg bg-white px-4 py-5">
            <SignatureVisual signature={supplierSig} fallbackName={supplierRep} />
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold text-slate-500">발주처 (구매자) 최종 서명</p>
          <p className="mt-0.5 text-[10px] text-slate-400">수령 확인 후 진행</p>
          <p className="mt-2 text-sm font-bold text-slate-900">{quote.client.companyName}</p>
          <div className="mt-4 flex min-h-[100px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white px-4 py-5 text-center">
            <span className="text-xl text-slate-300">🖋</span>
            <p className="mt-2 text-sm font-medium text-slate-400">
              {clientRep} 대표 · 발행 후 수령 확인
            </p>
          </div>
          <ul className="mt-4 space-y-1.5 text-[11px] text-slate-500">
            <li className="flex items-center gap-1.5">
              <Check className="size-3 shrink-0 text-slate-400" />
              서명 시 도착 확인·거래 완료에 자동 동의
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
