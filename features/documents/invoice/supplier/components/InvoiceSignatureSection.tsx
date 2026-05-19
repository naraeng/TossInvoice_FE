'use client';

import { Check } from 'lucide-react';

import { SignatureCanvas } from '@/features/documents/quote/shared/SignatureCanvas';
import { SignatureVisual } from '@/features/documents/quote/shared/SignatureVisual';
import { getInvoiceSupplierSignature } from '@/lib/documents/signature-utils';
import type { QuoteDocument } from '@/types/documents/document';

function formatSignedAt(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

type Props = {
  quote: QuoteDocument;
  hasInvoiceSignature?: boolean;
  issued?: boolean;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

export function InvoiceSignatureSection({
  quote,
  hasInvoiceSignature,
  issued = false,
  onSignatureChange,
}: Props) {
  const invoiceSig = getInvoiceSupplierSignature(quote);
  const supplierRep =
    quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규';
  const clientRep = quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ?? '김민수';
  const supplierSigned = issued || !!hasInvoiceSignature;

  return (
    <section className="mx-8 border-t border-slate-300/80 py-6">
      <p className="text-sm font-bold text-[#191919]">서명</p>
      <p className="mt-1 text-xs text-[#8E8E8E]">
        {issued
          ? '수주처 invoice 발행 서명이 완료되었습니다. 발주처는 수령 확인 후 최종 서명합니다.'
          : 'invoice 발행을 위해 수주처가 다시 서명합니다. 발주처는 수령 확인 후 최종 서명합니다.'}
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div
          className={
            supplierSigned
              ? 'rounded-xl border border-slate-200 bg-[#F8F9FA] p-4'
              : 'rounded-xl border-2 border-[#3182F6] p-4'
          }
        >
          <p className="text-xs font-semibold text-slate-500">수주처 (공급자) 서명</p>
          <p
            className={`mt-0.5 text-[10px] ${supplierSigned ? 'text-emerald-500' : 'text-slate-400'}`}
          >
            {supplierSigned ? 'invoice 발행 서명 완료' : 'invoice 발행 전 서명해 주세요'}
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">{quote.supplier.companyName}</p>

          {issued ? (
            <>
              <div className="mt-4 flex min-h-[100px] items-center justify-center rounded-lg bg-white px-4 py-5">
                <SignatureVisual signature={invoiceSig} fallbackName={supplierRep} />
              </div>
              {invoiceSig && (
                <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                  서명 일시: {formatSignedAt(invoiceSig.signedAt)}
                  <br />
                  인증서: 공동인증서 (사업자)
                </p>
              )}
            </>
          ) : (
            <>
              <SignatureCanvas
                className="mt-3"
                initialImage={invoiceSig?.signatureImage}
                onSignatureChange={onSignatureChange}
              />
              <ul
                className={`mt-1 space-y-1.5 text-[11px] ${hasInvoiceSignature ? 'text-emerald-500' : 'text-slate-500'}`}
              >
                <li className="flex items-center gap-1.5">
                  <Check
                    className={`size-3 shrink-0 ${hasInvoiceSignature ? 'text-emerald-500' : 'text-slate-400'}`}
                  />
                  서명 시 도착 확인·거래 완료에 자동 동의
                </li>
              </ul>
            </>
          )}
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold text-slate-500">발주처 (구매자) 최종 서명</p>
          <p className={`mt-0.5 text-[10px] ${issued ? 'text-blue-600' : 'text-slate-400'}`}>
            {issued ? 'invoice 수신 · 수령 확인 대기' : '수령 확인 후 진행'}
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">{quote.client.companyName}</p>
          <div className="mt-4 flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white px-4 py-5 text-center">
            <span className="text-xl text-slate-300">🖋</span>
            <p className="mt-2 text-sm font-medium text-slate-400">
              {clientRep} 대표 · {issued ? '수령 확인 대기' : '발행 후 수령 확인'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
