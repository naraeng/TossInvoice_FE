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
