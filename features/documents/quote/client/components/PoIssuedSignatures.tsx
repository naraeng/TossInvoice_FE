'use client';

import { SignatureCanvas } from '@/features/documents/quote/shared/SignatureCanvas';
import { SignatureVisual } from '@/features/documents/quote/shared/SignatureVisual';
import {
  getPoClientSignature,
  getPoSupplierSignature,
} from '@/lib/documents/signature-utils';
import type { QuoteDocument, UserRole } from '@/types/documents/document';

function formatSignedAt(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

type Props = {
  quote: QuoteDocument;
  viewerRole: UserRole;
  onSupplierSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

export function PoIssuedSignatures({
  quote,
  viewerRole,
  onSupplierSignatureChange,
}: Props) {
  const poSupplierSig = getPoSupplierSignature(quote);
  const clientSig = getPoClientSignature(quote);
  const supplierRep =
    quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규';
  const isSupplierView = viewerRole === 'SUPPLIER';
  const supplierPending = !poSupplierSig;

  return (
    <section className="mx-8 border-t border-slate-300/80 py-6">
      <p className="text-sm font-bold text-[#191919]">서명</p>
      <p className="mt-1 text-xs text-[#8E8E8E]">
        양 당사자의 전자서명이 완료되면 본 발주서는 법적 효력을 가집니다.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div
          className={
            isSupplierView && supplierPending
              ? 'rounded-xl border-2 border-[#3182F6] p-4'
              : 'rounded-xl border border-slate-200 bg-[#F8F9FA] p-4'
          }
        >
          <p className="text-xs font-semibold text-slate-500">공급자 (수주처) 서명</p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {isSupplierView && supplierPending
              ? '발주 내용 확인 후 서명해주세요'
              : poSupplierSig
                ? 'PO 확인 서명 완료'
                : '수주처 PO 서명 대기'}
          </p>

          {isSupplierView && supplierPending ? (
            <div className="mt-3">
              <p className="text-sm font-bold text-slate-900">{quote.supplier.companyName}</p>
              <p className="mt-0.5 text-xs text-slate-500">{supplierRep} 대표</p>
              <SignatureCanvas
                className="mt-3"
                onSignatureChange={onSupplierSignatureChange}
              />
            </div>
          ) : (
            <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-lg bg-white px-4 py-6">
              {poSupplierSig ? (
                <SignatureVisual signature={poSupplierSig} fallbackName={supplierRep} />
              ) : (
                <p className="text-center text-sm text-slate-400">수주처 서명 대기 중</p>
              )}
            </div>
          )}

          {poSupplierSig && (
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              서명 일시: {formatSignedAt(poSupplierSig.signedAt)}
              {poSupplierSig.ipAddress && ` · IP ${poSupplierSig.ipAddress}`}
              <br />
              인증서: 공동인증서 (사업자)
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
          <p className="text-xs font-semibold text-slate-500">발주자 (구매자) 서명</p>
          <p className="mt-0.5 text-[10px] text-slate-400">PO 발행 시 서명 완료</p>
          <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-lg bg-white px-4 py-6">
            <SignatureVisual signature={clientSig} />
          </div>
          {clientSig && (
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              서명 일시: {formatSignedAt(clientSig.signedAt)}
              {clientSig.ipAddress && ` · IP ${clientSig.ipAddress}`}
              <br />
              인증서: 공동인증서 (사업자)
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
