'use client';

import { SignatureCanvas } from '@/features/documents/quote/shared/SignatureCanvas';
import { getPiSupplierSignature } from '@/lib/documents/signature-utils';
import type { QuoteDocument } from '@/types/documents/document';

import { SectionCard, SectionTitle } from './SectionCard';

type Props = {
  quote?: QuoteDocument;
  onSigned?: (signed: boolean, signatureDataUrl?: string) => void;
};

export function SignaturePadSection({ quote, onSigned }: Props) {
  const initialImage = quote ? getPiSupplierSignature(quote)?.signatureImage : undefined;

  return (
    <SectionCard>
      <SectionTitle
        title="수주처 서명"
        badge={
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
            발행 시 필수
          </span>
        }
        subtitle="견적서를 발행하려면 서명이 필요합니다. 발주처 검토 후 거래가 진행돼요"
      />

      <SignatureCanvas initialImage={initialImage} onSignatureChange={onSigned} />
    </SectionCard>
  );
}
