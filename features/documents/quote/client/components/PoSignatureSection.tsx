'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { SignatureCanvas } from '@/features/documents/quote/shared/SignatureCanvas';
import { getPoClientSignature } from '@/lib/documents/signature-utils';
import { cn } from '@/lib/utils';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

/**
 * PO 작성 단계의 서명 영역 — 발주처 서명만 노출.
 * (PI 수주처 서명은 PI 문서 영역에서 확인 가능하므로 여기선 중복 표시하지 않음.)
 */
export function PoSignatureSection({ quote, onSignatureChange }: Props) {
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

      <div className="mt-4">
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
