import {
  buildPaymentMethodLabel,
  formatPaymentTerms,
  resolveDownPaymentPercent,
} from '@/lib/documents/payment-terms';
import { formatDeliveryScheduleSummary, resolveQuoteSchedule } from '@/lib/documents/schedule';
import type { CompanyProfile } from '@/types/documents/company';
import type { QuoteDocument } from '@/types/documents/document';

/**
 * 미입력 필드를 화면 렌더링이 깨지지 않게 비워둔 placeholder.
 * 실데이터는 백엔드 /users/me · /trades/{id} 응답으로 채움.
 */
export const DEFAULT_SUPPLIER_PROFILE: CompanyProfile = {
  businessNo: '',
  representative: '',
  address: '',
  contact: '',
  bankAccount: undefined,
  verified: false,
};

export const DEFAULT_CLIENT_PROFILE: CompanyProfile = {
  businessNo: '',
  representative: '',
  address: '',
  contact: '',
  verified: false,
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
  // 선금 비율 기반으로 paymentTerms/paymentMethod 일관되게 재구성
  const downPaymentPercent = resolveDownPaymentPercent(quote);

  return {
    ...quote,
    status: 'ISSUED',
    issuedAt,
    documentNo: buildDocumentNo(issuedAt, quote.documentNo),
    validityUntil: quote.validityUntil,
    productionDays: quote.productionDays,
    paymentDueDays: quote.paymentDueDays,
    downPaymentPercent,
    paymentTerms: quote.paymentTerms ?? formatPaymentTerms(downPaymentPercent),
    bankVerified: quote.bankVerified ?? true,
    // 실데이터 우선, 없으면 그대로 undefined
    supplierProfile: quote.supplierProfile,
    clientProfile: quote.clientProfile,
    transactionTerms: {
      paymentMethod:
        quote.transactionTerms?.paymentMethod ?? buildPaymentMethodLabel(downPaymentPercent),
      deliverySchedule:
        quote.transactionTerms?.deliverySchedule ??
        deliverySummary ??
        '발주처와 일정 합의 후 반영',
    },
    // 가짜 서명 자동 삽입 제거. 백엔드 trade detail의 sellerSignatureUrl/buyerSignatureUrl이 source of truth.
    // map-trade-to-quote.ts에서 백엔드 응답을 신뢰해 signatures를 채우므로 여기서는 사용자가 실제 그린 서명만 보존한다.
    signatures: quote.signatures,
  };
}
