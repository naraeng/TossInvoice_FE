'use client';

import { Check } from 'lucide-react';

import { calcPoPaymentAmounts } from '@/features/documents/quote/shared/po-payment';
import { SignatureCanvas } from '@/features/documents/quote/shared/SignatureCanvas';
import { SignatureVisual } from '@/features/documents/quote/shared/SignatureVisual';
import {
  getInvoiceClientSignature,
  getInvoiceSupplierSignature,
} from '@/lib/documents/signature-utils';
import { cn } from '@/lib/utils';
import type { QuoteDocument } from '@/types/documents/document';

function formatSignedAt(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

type Props = {
  quote: QuoteDocument;
  hasClientSignature?: boolean;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

const CONSENT_ITEMS = [
  '서명 시 도착 확인·거래 완료에 자동 동의',
  '서명 즉시 잔금이 수주처 계좌로 송금됩니다',
  '서명 후 취소·변경이 불가합니다',
];

export function ClientInvoiceSignatureSection({
  quote,
  hasClientSignature,
  onSignatureChange,
}: Props) {
  const supplierSig = getInvoiceSupplierSignature(quote);
  const clientSig = getInvoiceClientSignature(quote);
  const { balanceLabel } = calcPoPaymentAmounts(quote);
  const supplierRep =
    quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ??
    quote.supplier.companyName ??
    '';
  return (
    <section className="mx-8 border-t border-slate-300/80 py-6">
      <p className="text-sm font-bold text-[#191919]">서명</p>
      <p className="mt-1 text-xs text-[#8E8E8E]">
        invoice 발행 시 수주처 서명이 완료되었습니다. 물건 수령 확인 후 최종 서명해 주세요.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
          <div className="flex flex-row items-center gap-1.5">
            <p className="text-xs font-semibold text-slate-500">수주처 (공급자) 서명</p>
            <p className="ml-1 text-[10px] font-semibold text-emerald-600 border border-emerald-500 rounded-full px-2 py-0.5">
              invoice 발행 서명 완료
            </p>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900">{quote.supplier.companyName}</p>
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

        <div className="rounded-xl border-2 border-[#3182F6] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-rose-600">발주자 (구매자) 최종 서명 *</p>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#3182F6] ring-1 ring-blue-100">
              본인
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900">{quote.client.companyName}</p>
          <SignatureCanvas
            className="mt-3"
            initialImage={clientSig?.signatureImage}
            clearLabel="↺ 서명 지우기"
            onSignatureChange={onSignatureChange}
          />
          <ul
            className={cn(
              'mt-4 space-y-1.5 text-[11px]',
              hasClientSignature ? 'text-emerald-600' : 'text-slate-500'
            )}
          >
            {CONSENT_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check
                  className={cn(
                    'size-3 shrink-0',
                    hasClientSignature ? 'text-emerald-500' : 'text-slate-400'
                  )}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
