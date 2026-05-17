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

export interface SignatureRecord {
  party: UserRole;
  signedAt: string;
  signerName: string;
  ipAddress?: string;
}

export interface TransactionTerms {
  paymentMethod: string;
  deliverySchedule: string;
}

export interface QuoteDocument {
  id: string;
  documentNo: string;
  status: QuoteStatus;
  issuedAt: string;
  validityUntil?: string;
  paymentTerms?: string;
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
}

export interface QuoteScreenProps {
  quote: QuoteDocument;
  editable?: boolean;
  showSignature?: boolean;
}
