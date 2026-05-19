'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { SignatureCanvas } from '@/features/documents/quote/shared/SignatureCanvas';
import { SignatureVisual } from '@/features/documents/quote/shared/SignatureVisual';
import { getPiSupplierSignature, getPoClientSignature } from '@/lib/documents/signature-utils';
import { cn } from '@/lib/utils';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

export function PoSignatureSection({ quote, onSignatureChange }: Props) {
  const supplierSignature = getPiSupplierSignature(quote);
  const clientDraftSig = getPoClientSignature(quote);
  const [localSigned, setLocalSigned] = useState(false);
  const isClientSigned = !!clientDraftSig?.signatureImage || localSigned;

  const handleSignatureChange = (signed: boolean, imageDataUrl?: string) => {
    setLocalSigned(signed);
    onSignatureChange?.(signed, imageDataUrl);
  };

  const hintTextClass = isClientSigned ? 'text-emerald-600' : 'text-slate-500';
  const hintIconClass = isClientSigned ? 'text-emerald-500' : 'text-slate-400';

  return (
    <section className="mx-8 border-t border-slate-300/80 py-6">
      <h2 className="text-sm font-bold text-slate-900">서명</h2>
      <p className="mt-1 text-xs text-slate-500">
        전자서명법에 따라 본 문서의 서명은 법적 효력을 가집니다.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
          <p className="text-xs font-semibold text-slate-500">수주처 (공급자)</p>
          <p className="mt-0.5 text-[10px] text-slate-400">PI 발행 시 서명 완료</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{quote.supplier.companyName}</p>
          <div className="mt-4 flex min-h-30 items-center justify-center rounded-lg bg-white px-4 py-6">
            <SignatureVisual signature={supplierSignature} fallbackName="박장규" />
          </div>
          {supplierSignature && (
            <p className="mt-3 text-[10px] text-slate-400">
              서명 일시: {new Date(supplierSignature.signedAt).toLocaleString('ko-KR')}
              {supplierSignature.ipAddress && ` · IP ${supplierSignature.ipAddress}`}
            </p>
          )}
        </div>

        <div className="rounded-xl border-2 border-[#3182F6] p-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-slate-800">발주처 (구매자) 서명</p>
            <span className="text-xs font-bold text-rose-500">*</span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-900">{quote.client.companyName}</p>
          <SignatureCanvas
            className="mt-3"
            initialImage={clientDraftSig?.signatureImage}
            onSignatureChange={handleSignatureChange}
          />
          <ul className={cn('mt-4 space-y-1.5 text-[11px]', hintTextClass)}>
            <li className="flex items-center gap-1.5">
              <Check className={cn('size-3 shrink-0', hintIconClass)} />
              서명 시 발주 조건에 자동 동의됩니다
            </li>
            <li className="flex items-center gap-1.5">
              <Check className={cn('size-3 shrink-0', hintIconClass)} />
              발행 후 수주처에 PO가 전송됩니다
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
