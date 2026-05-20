import type { TradeRole } from '@/features/trade/types';

export type TradePartyDetail = {
  userId: number;
  companyName: string;
  businessNumber: string;
  ceoName?: string;
  address?: string;
  phone?: string;
  email?: string;
};

export type TradeDetailItem = {
  productName: string;
  productNum: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type ProformaInvoiceDetail = {
  docNumber: string;
  proformaInvoiceDatetime: string;
  productionDays: number;
  validUntil: string;
  sellerSignatureUrl: string;
  sellerSignedAt: string;
};

export type PurchaseOrderDetail = {
  docNumber: string;
  purchaseOrderDatetime: string;
  desiredDeliveryDate?: string;
  confirmedDeliveryDate?: string;
  /** 발주처가 PO 발행 시 입력한 배송 주소 (Phase A 백엔드 추가) */
  shippingAddress?: string | null;
  buyerSignatureUrl?: string | null;
  buyerSignedAt?: string | null;
  sellerSignatureUrl?: string | null;
  sellerSignedAt?: string | null;
  sellerAccountSnapshot?: string;
  sellerBankSnapshot?: string;
  depositPaidAt?: string | null;
  depositAmount?: number | null;
};

export type InvoiceDetail = {
  docNumber: string;
  invoiceDatetime: string;
  shippingInfo?: string;
  sellerSignatureUrl?: string;
  sellerSignedAt?: string;
  buyerSignatureUrl?: string;
  buyerSignedAt?: string;
  /** Invoice 발행 시점에 확정된 수주처 계좌 스냅샷 — PO 스냅샷보다 우선 */
  sellerAccountSnapshot?: string | null;
  sellerBankSnapshot?: string | null;
  balancePaidAt?: string | null;
  balanceAmount?: number | null;
};

/** GET /api/v1/trades/{tradeId} result */
export type TradeDetailResult = {
  tradeId: number;
  status: string;
  role: TradeRole;
  seller: TradePartyDetail;
  buyer: TradePartyDetail;
  depositRate: number;
  totalAmount: number;
  tax: number;
  items: TradeDetailItem[];
  proformaInvoice: ProformaInvoiceDetail | null;
  purchaseOrder: PurchaseOrderDetail | null;
  invoice: InvoiceDetail | null;
  createdAt: string;
};

export type TradeDetailApiResponse = {
  errorCode: string | null;
  message: string;
  result: TradeDetailResult | null;
};
