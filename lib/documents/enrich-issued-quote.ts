import { formatDeliveryScheduleSummary, resolveQuoteSchedule } from '@/lib/documents/schedule';
import type { CompanyProfile } from '@/types/documents/company';
import type { QuoteDocument } from '@/types/documents/document';

export const DEFAULT_SUPPLIER_PROFILE: CompanyProfile = {
  businessNo: '123-45-67890',
  representative: '박장규',
  address: '서울시 강남구 테헤란로 123, 4층',
  contact: '02-1234-5678 · pi@jangfood.co.kr',
  bankAccount: '국민은행 · 123456-78-901234',
  verified: true,
};

export const DEFAULT_CLIENT_PROFILE: CompanyProfile = {
  businessNo: '987-65-43210',
  representative: '김민수',
  address: '서울시 마포구 연남동 45-12',
  contact: '010-9876-5432 · order@nalae.coffee',
  verified: true,
};

function buildDocumentNo(issuedAt: string, existing?: string) {
  if (existing?.startsWith('PI-')) return existing;
  const compact = issuedAt.replace(/-/g, '');
  return `PI-${compact.slice(0, 4)}-${compact.slice(4, 6)}${compact.slice(6, 8)}-001`;
}

/** DRAFT → ISSUED 전환 시 PI 문서 필드 보강 */
export function enrichIssuedQuote(quote: QuoteDocument): QuoteDocument {
  const issuedAt = quote.issuedAt || new Date().toISOString().slice(0, 10);
  const schedule = resolveQuoteSchedule(quote);
  const deliverySummary = formatDeliveryScheduleSummary(schedule);
  const hasSupplierSig = quote.signatures.some(
    (s) => s.party === 'SUPPLIER' && (s.scope === 'PI' || !s.scope)
  );

  return {
    ...quote,
    status: 'ISSUED',
    issuedAt,
    documentNo: buildDocumentNo(issuedAt, quote.documentNo),
    validityUntil: quote.validityUntil,
    productionDays: quote.productionDays,
    paymentDueDays: quote.paymentDueDays,
    paymentTerms: quote.paymentTerms ?? '선금 30% / 잔금 70%',
    bankVerified: quote.bankVerified ?? true,
    supplierProfile: quote.supplierProfile ?? DEFAULT_SUPPLIER_PROFILE,
    clientProfile: quote.clientProfile ?? DEFAULT_CLIENT_PROFILE,
    transactionTerms: {
      paymentMethod:
        quote.transactionTerms?.paymentMethod ??
        '안전결제 (선금 30% PO 합의 시 / 잔금 70% 납품 확인 시)',
      deliverySchedule:
        quote.transactionTerms?.deliverySchedule ??
        deliverySummary ??
        '발주처와 일정 합의 후 반영',
    },
    signatures: hasSupplierSig
      ? quote.signatures
      : [
          ...quote.signatures,
          {
            party: 'SUPPLIER',
            scope: 'PI',
            signedAt: new Date().toISOString(),
            signerName:
              quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규',
            ipAddress: '203.241.128.45',
          },
        ],
  };
}
