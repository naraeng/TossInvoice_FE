import { calcTotals } from '@/lib/documents/calc-totals';
import { enrichIssuedQuote } from '@/lib/documents/enrich-issued-quote';
import { enrichPoDraft } from '@/lib/documents/enrich-po-draft';
import { formatPaymentTerms } from '@/lib/documents/payment-terms';
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
  if (!value) return new Date().toISOString().slice(0, 10);
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : value.slice(0, 10);
}

function parseIsoFromApi(value?: string | null): string {
  if (!value) return new Date().toISOString();
  if (value.includes('T')) return value;
  return value.replace(' ', 'T');
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
  /** 수주중(SELLER) / 발주중(BUYER) 탭에서 연 화면 */
  perspectiveRole?: TradeRole;
};

/** GET /api/v1/trades/{tradeId} → QuoteDocument */
export function mapTradeDetailToQuote(
  detail: TradeDetailResult,
  options?: MapTradeDetailOptions,
): QuoteDocument {
  const items = mapApiItems(detail.items ?? []);
  const status = deriveQuoteStatusFromTrade(detail, options?.perspectiveRole);
  const pi = detail.proformaInvoice;
  const po = detail.purchaseOrder;
  const inv = detail.invoice;
  const depositRate = detail.depositRate ?? 30;
  const deliveryDate = po?.confirmedDeliveryDate ?? po?.desiredDeliveryDate;
  const parsedShipping = parseInvoiceShippingInfo(inv?.shippingInfo);
  const sellerBankAccount = resolveSellerBankAccount(po);

  const quote: QuoteDocument = {
    id: tradeDetailToQuoteId(detail.tradeId),
    tradeId: detail.tradeId,
    status,
    documentNo: pi?.docNumber ?? `PI-${detail.tradeId}`,
    piDocumentNo: pi?.docNumber,
    issuedAt: parseDateFromApi(pi?.proformaInvoiceDatetime ?? detail.createdAt),
    validityUntil: parseDateFromApi(pi?.validUntil),
    productionDays: pi?.productionDays,
    downPaymentPercent: depositRate,
    paymentTerms: formatPaymentTerms(depositRate),
    poDocumentNo: po?.docNumber,
    poIssuedAt: po ? parseDateFromApi(po.purchaseOrderDatetime) : undefined,
    deliveryDate: deliveryDate ? parseDateFromApi(deliveryDate) : undefined,
    invoiceDocumentNo: inv?.docNumber,
    invoiceIssuedAt: inv ? parseDateFromApi(inv.invoiceDatetime) : undefined,
    courier: parsedShipping.courier ?? 'CJ대한통운',
    trackingNumber: parsedShipping.trackingNumber,
    shipmentDate: inv ? parseDateFromApi(inv.invoiceDatetime) : undefined,
    estimatedArrival: deliveryDate ? parseDateFromApi(deliveryDate) : undefined,
    depositPaidAt: po?.depositPaidAt ? parseIsoFromApi(po.depositPaidAt) : undefined,
    balancePaidAt: inv?.balancePaidAt ? parseIsoFromApi(inv.balancePaidAt) : undefined,
    supplier: toDocumentUser(detail.seller, 'SUPPLIER'),
    client: toDocumentUser(detail.buyer, 'CLIENT'),
    items,
    totals: totalsFromApi(detail, items),
    supplierProfile: toCompanyProfile(
      detail.seller,
      detail.seller.businessNumber,
      sellerBankAccount,
    ),
    clientProfile: toCompanyProfile(detail.buyer, detail.buyer.businessNumber),
    bankVerified: true,
    signatures: buildSignatures(detail),
    transactionTerms: {
      paymentMethod: '안전결제 (선금 30% PO 합의 시 / 잔금 70% 납품 확인 시)',
      deliverySchedule: po?.confirmedDeliveryDate
        ? `${po.confirmedDeliveryDate.replace(/-/g, '.')} (발주처 확정)`
        : '발주처와 일정 합의 후 반영',
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
    downPaymentPercent: 30,
    paymentTerms: formatPaymentTerms(30),
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
    signatures: [],
  };

  return enrichIssuedQuote(quote);
}
