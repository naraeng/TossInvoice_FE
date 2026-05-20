import { calcTotals } from '@/lib/documents/calc-totals';
import { enrichIssuedQuote } from '@/lib/documents/enrich-issued-quote';
import { enrichPoDraft } from '@/lib/documents/enrich-po-draft';
import {
  buildPaymentMethodLabel,
  DEFAULT_DOWN_PAYMENT_PERCENT,
  formatPaymentTerms,
} from '@/lib/documents/payment-terms';
import { resolveDocumentCompanyIdFromParty } from '@/lib/documents/resolve-current-company';
import type { TradeApiRow, TradeRole } from '@/features/trade/types';
import type { CompanyProfile } from '@/types/documents/company';
import type {
  DocumentUser,
  LineItem,
  QuoteDocument,
  QuoteStatus,
  SignatureRecord,
} from '@/types/documents/document';

import { deriveQuoteStatusFromTrade } from './derive-quote-status-from-trade';
import { parseInvoiceShippingInfo } from './parse-invoice-shipping-info';
import type { TradeDetailItem, TradeDetailResult } from './trade-detail-types';

export function tradeDetailToQuoteId(tradeId: number): string {
  return `trade-${tradeId}`;
}

function digitsOnly(value?: string | null): string {
  return (value ?? '').replace(/\D/g, '');
}

function formatBusinessNo(value?: string): string {
  const d = digitsOnly(value);
  if (d.length !== 10) return value?.trim() || '';
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

function parseDateFromApi(value?: string | null): string {
  // 호출처 다수가 '오늘' fallback에 의존(목록 fallback, 시각 미상 시 표시용).
  // 명시적으로 "빈 값 허용"이 필요한 위치는 parseDateFromApiOptional() 사용.
  if (!value) return new Date().toISOString().slice(0, 10);
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : value.slice(0, 10);
}

/** value가 없으면 undefined를 반환 — '오늘' 가짜 fallback 방지 */
function parseDateFromApiOptional(value?: string | null): string | undefined {
  if (!value) return undefined;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : value.slice(0, 10);
}

function parseIsoFromApi(value?: string | null): string {
  if (!value) return new Date().toISOString();
  if (value.includes('T')) return value;
  return value.replace(' ', 'T');
}

/** 백엔드 datetime(yyyy-MM-dd HH:mm:ss) → ISO 문자열, 없으면 undefined */
function parseDateTimeFromApi(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (value.includes('T')) return value;
  // 'yyyy-MM-dd HH:mm:ss' 또는 'yyyy-MM-dd' 모두 처리
  if (value.includes(' ')) return value.replace(' ', 'T');
  return `${value}T00:00:00`;
}

/** PO 응답 sellerBank/Account 스냅샷 → "X은행 · 1234-..." 표시용 단일 라인 */
function formatBankAccountLine(
  bank?: string | null,
  account?: string | null,
): string | undefined {
  const b = bank?.trim();
  const a = account?.trim();
  if (b && a) {
    const bankLabel = b.endsWith('은행') ? b : `${b}은행`;
    return `${bankLabel} · ${a}`;
  }
  return b || a || undefined;
}

function toDocumentUser(
  party: TradeDetailResult['seller'],
  role: DocumentUser['role'],
): DocumentUser {
  return {
    companyId: resolveDocumentCompanyIdFromParty(party),
    companyName: party.companyName,
    role,
  };
}

function resolveSellerBankAccount(
  po: TradeDetailResult['purchaseOrder'],
): string | undefined {
  if (!po) return undefined;

  const bank = po.sellerBankSnapshot?.trim();
  const account = po.sellerAccountSnapshot?.trim();
  if (bank && account) {
    const bankLabel = bank.endsWith('은행') ? bank : `${bank}은행`;
    return `${bankLabel} · ${account}`;
  }

  return bank || account;
}

function toCompanyProfile(
  party: TradeDetailResult['seller'],
  businessNo: string,
  bankAccount?: string,
): CompanyProfile {
  const rep = party.ceoName?.trim() || '';
  const contact = [party.phone, party.email].filter(Boolean).join(' · ');

  return {
    businessNo: formatBusinessNo(businessNo) || businessNo,
    representative: rep.includes('대표') ? rep : rep ? `${rep} 대표` : '',
    address: party.address ?? '',
    contact,
    bankAccount,
    verified: true,
  };
}

function mapApiItems(items: TradeDetailItem[]): LineItem[] {
  return items.map((item, index) => ({
    id: String(item.productNum ?? index + 1),
    description: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));
}

function totalsFromApi(detail: TradeDetailResult, items: LineItem[]): QuoteDocument['totals'] {
  if (typeof detail.tax === 'number' && typeof detail.totalAmount === 'number') {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return {
      subtotal: subtotal > 0 ? subtotal : detail.totalAmount - detail.tax,
      tax: detail.tax,
      total: detail.totalAmount,
    };
  }
  return calcTotals(items);
}

function buildSignatures(detail: TradeDetailResult): SignatureRecord[] {
  const signatures: SignatureRecord[] = [];
  const pi = detail.proformaInvoice;
  const po = detail.purchaseOrder;
  const inv = detail.invoice;

  if (pi?.sellerSignatureUrl) {
    signatures.push({
      party: 'SUPPLIER',
      scope: 'PI',
      signedAt: parseIsoFromApi(pi.sellerSignedAt ?? pi.proformaInvoiceDatetime),
      signerName: detail.seller.ceoName ?? detail.seller.companyName,
      signatureImage: pi.sellerSignatureUrl,
    });
  }

  if (po?.buyerSignatureUrl) {
    signatures.push({
      party: 'CLIENT',
      scope: 'PO',
      signedAt: parseIsoFromApi(po.buyerSignedAt ?? po.purchaseOrderDatetime),
      signerName: detail.buyer.ceoName ?? detail.buyer.companyName,
      signatureImage: po.buyerSignatureUrl,
    });
  }

  if (po?.sellerSignatureUrl) {
    signatures.push({
      party: 'SUPPLIER',
      scope: 'PO',
      signedAt: parseIsoFromApi(po.sellerSignedAt ?? po.purchaseOrderDatetime),
      signerName: detail.seller.ceoName ?? detail.seller.companyName,
      signatureImage: po.sellerSignatureUrl,
    });
  }

  if (inv?.sellerSignatureUrl) {
    signatures.push({
      party: 'SUPPLIER',
      scope: 'INVOICE',
      signedAt: parseIsoFromApi(inv.sellerSignedAt ?? inv.invoiceDatetime),
      signerName: detail.seller.ceoName ?? detail.seller.companyName,
      signatureImage: inv.sellerSignatureUrl,
    });
  }

  if (inv?.buyerSignatureUrl) {
    signatures.push({
      party: 'CLIENT',
      scope: 'INVOICE',
      signedAt: parseIsoFromApi(inv.buyerSignedAt ?? inv.invoiceDatetime),
      signerName: detail.buyer.ceoName ?? detail.buyer.companyName,
      signatureImage: inv.buyerSignatureUrl,
    });
  }

  return signatures;
}

function applyStatusPresentation(quote: QuoteDocument, status: QuoteStatus): QuoteDocument {
  const piBase = enrichIssuedQuote({ ...quote, status: 'ISSUED' });

  if (status === 'ISSUED') {
    return { ...piBase, status: 'ISSUED', signatures: quote.signatures };
  }

  if (status === 'PO_DRAFT') {
    const draft = enrichPoDraft(piBase);
    return {
      ...draft,
      ...quote,
      status: 'PO_DRAFT',
      signatures: quote.signatures.length ? quote.signatures : draft.signatures,
    };
  }

  if (
    status === 'PO_ISSUED' ||
    status === 'PO_CONFIRMED' ||
    status === 'INVOICE_ISSUED' ||
    status === 'INVOICE_COMPLETED'
  ) {
    return {
      ...piBase,
      ...quote,
      status,
      piDocumentNo: quote.piDocumentNo ?? piBase.documentNo,
      signatures: quote.signatures.length ? quote.signatures : piBase.signatures,
    };
  }

  return { ...quote, status };
}

type MapTradeDetailOptions = {
  /**
   * 수주중(SELLER) / 발주중(BUYER) — 화면 진입 탭 기준 viewer role.
   * status 결정에는 영향 없고, 향후 viewer-specific 뷰 분기/디버깅에 사용.
   */
  perspectiveRole: TradeRole;
};

/** GET /api/v1/trades/{tradeId} → QuoteDocument */
export function mapTradeDetailToQuote(
  detail: TradeDetailResult,
  options: MapTradeDetailOptions,
): QuoteDocument {
  // perspectiveRole은 호출처(QuoteDetailContainer/InvoiceDetailContainer/openTradeQuote)에서 항상 명시
  void options.perspectiveRole;
  const items = mapApiItems(detail.items ?? []);
  const status = deriveQuoteStatusFromTrade(detail);
  const pi = detail.proformaInvoice;
  const po = detail.purchaseOrder;
  const inv = detail.invoice;
  const depositRate = detail.depositRate ?? DEFAULT_DOWN_PAYMENT_PERCENT;
  // 표시용 날짜는 confirmed 우선, 없으면 desired
  const displayDeliveryDate = po?.confirmedDeliveryDate ?? po?.desiredDeliveryDate;
  const parsedShipping = parseInvoiceShippingInfo(inv?.shippingInfo);
  const sellerBankAccount = resolveSellerBankAccount(po);
  // Invoice 단계의 계좌 스냅샷이 있으면 우선, 없으면 PO 스냅샷
  const invoiceBankAccountLine =
    formatBankAccountLine(inv?.sellerBankSnapshot, inv?.sellerAccountSnapshot) ?? sellerBankAccount;

  // 납기 일정 라벨: PO 진행 단계에 따라 desired/confirmed 양쪽 표시
  const deliveryScheduleLabel = (() => {
    const desired = po?.desiredDeliveryDate;
    const confirmed = po?.confirmedDeliveryDate;
    if (confirmed && desired && confirmed !== desired) {
      return `발주처 희망 ${desired.replace(/-/g, '.')} → 수주처 확정 ${confirmed.replace(/-/g, '.')}`;
    }
    if (confirmed) return `${confirmed.replace(/-/g, '.')} (발주처 확정)`;
    if (desired) return `${desired.replace(/-/g, '.')} (발주처 희망 · 수주처 확정 대기)`;
    return '발주처와 일정 합의 후 반영';
  })();

  const quote: QuoteDocument = {
    id: tradeDetailToQuoteId(detail.tradeId),
    tradeId: detail.tradeId,
    // 신고/문의 등에서 백엔드 userId가 필요하므로 trade detail에서 보존
    sellerUserId: detail.seller.userId,
    buyerUserId: detail.buyer.userId,
    status,
    documentNo: pi?.docNumber ?? `PI-${detail.tradeId}`,
    piDocumentNo: pi?.docNumber,
    // PI 발행 전(pi=null)에는 거래 생성 시각으로 fallback
    issuedAt: parseDateFromApi(pi?.proformaInvoiceDatetime ?? detail.createdAt),
    // pi가 null이면 validityUntil은 비워둠 ('오늘'로 가짜 fallback 금지)
    validityUntil: parseDateFromApiOptional(pi?.validUntil),
    productionDays: pi?.productionDays,
    downPaymentPercent: depositRate,
    paymentTerms: formatPaymentTerms(depositRate),
    poDocumentNo: po?.docNumber,
    poIssuedAt: parseDateFromApiOptional(po?.purchaseOrderDatetime),
    deliveryDate: parseDateFromApiOptional(displayDeliveryDate),
    desiredDeliveryDate: parseDateFromApiOptional(po?.desiredDeliveryDate),
    confirmedDeliveryDate: parseDateFromApiOptional(po?.confirmedDeliveryDate),
    shippingAddress: po?.shippingAddress?.trim() || undefined,
    invoiceDocumentNo: inv?.docNumber,
    invoiceIssuedAt: parseDateFromApiOptional(inv?.invoiceDatetime),
    // datetime (HH:mm 포함) — 표시 측에서 정확한 시각 필요할 때 사용
    proformaInvoiceDatetime: parseDateTimeFromApi(pi?.proformaInvoiceDatetime),
    purchaseOrderDatetime: parseDateTimeFromApi(po?.purchaseOrderDatetime),
    invoiceDatetime: parseDateTimeFromApi(inv?.invoiceDatetime),
    courier: parsedShipping.courier ?? 'CJ대한통운',
    trackingNumber: parsedShipping.trackingNumber,
    // NOTE: 백엔드에 실제 출고일 필드가 없어 인보이스 발행 시각을 임시 사용 — 표시 라벨은 '인보이스 발행일'
    shipmentDate: parseDateFromApiOptional(inv?.invoiceDatetime),
    estimatedArrival: parseDateFromApiOptional(displayDeliveryDate),
    depositPaidAt: po?.depositPaidAt ? parseIsoFromApi(po.depositPaidAt) : undefined,
    balancePaidAt: inv?.balancePaidAt ? parseIsoFromApi(inv.balancePaidAt) : undefined,
    actualDepositAmount: typeof po?.depositAmount === 'number' ? po.depositAmount : undefined,
    actualBalanceAmount: typeof inv?.balanceAmount === 'number' ? inv.balanceAmount : undefined,
    invoiceSellerAccount: invoiceBankAccountLine,
    supplier: toDocumentUser(detail.seller, 'SUPPLIER'),
    client: toDocumentUser(detail.buyer, 'CLIENT'),
    items,
    totals: totalsFromApi(detail, items),
    supplierProfile: toCompanyProfile(
      detail.seller,
      detail.seller.businessNumber,
      // Invoice 단계의 스냅샷이 우선
      invoiceBankAccountLine,
    ),
    clientProfile: toCompanyProfile(detail.buyer, detail.buyer.businessNumber),
    bankVerified: true,
    // 백엔드가 별도 status 필드를 내려주지 않으므로 거래 진입 시점은 '정상' 처리
    clientStatus: '정상',
    signatures: buildSignatures(detail),
    transactionTerms: {
      paymentMethod: buildPaymentMethodLabel(depositRate),
      deliverySchedule: deliveryScheduleLabel,
    },
  };

  return applyStatusPresentation(quote, status);
}

/** 목록 API 실패 시 폴백 (필드 최소) */
export function mapTradeRowToQuote(row: TradeApiRow): QuoteDocument {
  const items: LineItem[] = row.itemsSummary
    ? [{ id: '1', description: row.itemsSummary, quantity: 1, unitPrice: 0 }]
    : [{ id: '1', description: '품목 정보 없음', quantity: 1, unitPrice: 0 }];

  const status: QuoteStatus = row.status === 'PENDING_PO' ? 'ISSUED' : 'ISSUED';

  const quote: QuoteDocument = {
    id: tradeDetailToQuoteId(row.tradeId),
    tradeId: row.tradeId,
    status,
    documentNo: row.invoiceDocNumber?.startsWith('PI') ? row.invoiceDocNumber : `PI-${row.tradeId}`,
    issuedAt: parseDateFromApi(row.createdAt),
    downPaymentPercent: DEFAULT_DOWN_PAYMENT_PERCENT,
    paymentTerms: formatPaymentTerms(DEFAULT_DOWN_PAYMENT_PERCENT),
    supplier: toDocumentUser(row.seller, 'SUPPLIER'),
    client: toDocumentUser(row.buyer, 'CLIENT'),
    items,
    totals:
      row.totalAmount > 0
        ? {
            subtotal: Math.round(row.totalAmount / 1.1),
            tax: row.totalAmount - Math.round(row.totalAmount / 1.1),
            total: row.totalAmount,
          }
        : calcTotals(items),
    supplierProfile: toCompanyProfile(row.seller, row.seller.businessNumber),
    clientProfile: toCompanyProfile(row.buyer, row.buyer.businessNumber),
    bankVerified: true,
    clientStatus: '정상',
    signatures: [],
  };

  return enrichIssuedQuote(quote);
}
