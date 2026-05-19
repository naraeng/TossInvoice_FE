import type { QuoteDocument } from '@/types/documents/document';

function buildPoDocumentNo(issuedAt: string) {
  const compact = issuedAt.replace(/-/g, '');
  return `PO-${compact.slice(0, 4)}-${compact.slice(4, 6)}${compact.slice(6, 8)}-001`;
}

/** ISSUED → PO_DRAFT 전환 시 발주서 필드 보강 */
export function enrichPoDraft(quote: QuoteDocument): QuoteDocument {
  const poIssuedAt = quote.poIssuedAt ?? new Date().toISOString().slice(0, 10);
  const piDocumentNo = quote.piDocumentNo ?? quote.documentNo;

  return {
    ...quote,
    status: 'PO_DRAFT',
    piDocumentNo,
    poDocumentNo: quote.poDocumentNo ?? buildPoDocumentNo(poIssuedAt),
    poIssuedAt,
    transactionTerms: quote.transactionTerms ?? {
      paymentMethod: '안전결제 (선금 30% PO 합의 시 / 잔금 70% 납품 확인 시)',
      deliverySchedule: '발주처 납품일 확정 후 자동 반영',
    },
  };
}
