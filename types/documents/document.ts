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
  | 'INVOICE_ISSUED'  // 최종 인보이스 (발주처 수령·서명 대기)
  | 'INVOICE_COMPLETED'; // 거래 완료 · 양측 보관용 invoice

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
  /** 거래보기(GET /trades/{id}) 시 탭 역할로 확정한 화면 역할 */
  viewerRoleHint?: UserRole;
  /** 거래 상대방 신고 등 API 호출 시 필요한 백엔드 userId — trade detail 응답에서 보존 */
  sellerUserId?: number;
  buyerUserId?: number;
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
  /** 발주처(거래처) 위험도 — 회사 검증 API의 status 원본('정상'/'주의'/'위험') */
  clientStatus?: '정상' | '주의' | '위험';
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
  /** 선금 입금 완료 시각 */
  depositPaidAt?: string;
  /** 잔금 송금 완료 시각 */
  balancePaidAt?: string;
  /** PO 확정 후 백엔드가 내려준 실제 선금 입금액 (없으면 클라 계산) */
  actualDepositAmount?: number;
  /** Invoice 완료 후 백엔드가 내려준 실제 잔금 송금액 (없으면 클라 계산) */
  actualBalanceAmount?: number;
  /** 발주처 희망 납품일 (PO 발행 시 입력) */
  desiredDeliveryDate?: string;
  /** 수주처 확정 납품일 (PO 카운터서명 시 확정) */
  confirmedDeliveryDate?: string;
  /** PI 발행 datetime (HH:mm 포함, 백엔드 yyyy-MM-dd HH:mm:ss → ISO) */
  proformaInvoiceDatetime?: string;
  /** PO 발행 datetime (HH:mm 포함, 백엔드 yyyy-MM-dd HH:mm:ss → ISO) */
  purchaseOrderDatetime?: string;
  /** Invoice 발행 datetime (HH:mm 포함, 백엔드 yyyy-MM-dd HH:mm:ss → ISO) */
  invoiceDatetime?: string;
  /** Invoice 단계 수주처 계좌 스냅샷 (없으면 PO 스냅샷 fallback) */
  invoiceSellerAccount?: string;
}

export interface QuoteScreenProps {
  quote: QuoteDocument;
  editable?: boolean;
  showSignature?: boolean;
}
