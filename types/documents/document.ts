import type { CompanyProfile } from '@/types/documents/company';

export type UserRole = 'SUPPLIER' | 'CLIENT';
export type DocumentType = 'QUOTE' | 'PURCHASE_ORDER' | 'INVOICE';

export type QuoteStatus =
  | 'DRAFT'           // 수주처 작성중
  | 'ISSUED'          // 견적 발행 완료
  | 'REJECTED'        // 발주처 반려
  | 'PO_DRAFT'        // 발주처 PO 작성중
  | 'PO_ISSUED'       // 발주서 발행 완료
  | 'PO_CONFIRMED'    // 양측 서명 완료
  | 'INVOICE_ISSUED'; // 최종 인보이스

export type QuoteAction =
  | 'ISSUE_QUOTE' // 견적서 발행
  | 'REJECT_QUOTE'  // 견적서 반려
  | 'START_PO'      // 발주서 작성 시작
  | 'ISSUE_PO'      // 발주서 발행
  | 'SIGN_PO' // 발주서 서명(수주처)
  | 'CONFIRM_PO' // 발주서 확정(발주처)
  | 'ISSUE_INVOICE'; // 인보이스 발행

export interface DocumentUser {
  companyId: string;
  companyName: string;
  role: UserRole;
}

export interface LineItem {
  id: string;
  description: string;
  detail?: string;
  quantity: number;
  unitPrice: number;
}

export interface Totals {
  subtotal: number;
  tax: number;
  total: number;
}

export type SignatureScope = 'PI' | 'PO' | 'INVOICE';

export interface SignatureRecord {
  party: UserRole;
  /** PI(견적) / PO(발주) 구분 — 미지정 시 party·문맥으로 추론 */
  scope?: SignatureScope;
  signedAt: string;
  signerName: string;
  ipAddress?: string;
  /** 캔버스 서명 이미지 (data URL) */
  signatureImage?: string;
}

export interface TransactionTerms {
  paymentMethod: string;
  deliverySchedule: string;
}

export interface QuoteDocument {
  id: string;
  /** POST /api/v1/trades 성공 시 생성된 거래 ID */
  tradeId?: number;
  documentNo: string;
  status: QuoteStatus;
  issuedAt: string;
  validityUntil?: string;
  /** 제작 소요일 (API: productionDays, ≥1) */
  productionDays?: number;
  /** 결제 완료 기한 — 납품 후 N일 */
  paymentDueDays?: number;
  paymentTerms?: string;
  /** 선금 비율 (0–100). 미지정 시 paymentTerms 또는 기본 30% */
  downPaymentPercent?: number;
  supplier: DocumentUser;
  client: DocumentUser;
  supplierProfile?: CompanyProfile;
  clientProfile?: CompanyProfile;
  items: LineItem[];
  totals: Totals;
  signatures: SignatureRecord[];
  transactionTerms?: TransactionTerms;
  note?: string;
  bankVerified?: boolean;
  /** PI 견적번호 (PO 작성 시 참조) */
  piDocumentNo?: string;
  /** 발주서 번호 */
  poDocumentNo?: string;
  /** 발주일 (PO) */
  poIssuedAt?: string;
  /** 납품 희망일 */
  deliveryDate?: string;
  /** 배송 주소 */
  shippingAddress?: string;
  /** 거래 토큰 (PO 발행 후) */
  transactionToken?: string;
  /** invoice 번호 */
  invoiceDocumentNo?: string;
  /** invoice 발행(또는 작성 시작) 시각 */
  invoiceIssuedAt?: string;
  /** 택배사 */
  courier?: string;
  /** 운송장 번호 */
  trackingNumber?: string;
  /** 발송일 */
  shipmentDate?: string;
  /** 도착 예정일 */
  estimatedArrival?: string;
  /** 물건 도착 확인 시각 (발주처) */
  arrivalConfirmedAt?: string;
}

export interface QuoteScreenProps {
  quote: QuoteDocument;
  editable?: boolean;
  showSignature?: boolean;
}
