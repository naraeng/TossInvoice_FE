import type { UserRole, QuoteStatus } from '@/types/documents/document';

export interface ScreenConfig {
  title: string;
  editable: boolean;
  showSignature: boolean;
  primaryAction?: { label: string; action: string };
  secondaryAction?: { label: string; action: string };
}

export const QUOTE_SCREEN_MAP: Record<
  UserRole,
  Partial<Record<QuoteStatus, ScreenConfig>>
> = {
  SUPPLIER: {
    DRAFT: {
      title: '견적서 작성',
      editable: true,
      showSignature: true,
      primaryAction: { label: '서명하고 견적서 발행', action: 'ISSUE_QUOTE' },
      secondaryAction: { label: '임시저장', action: 'SAVE_DRAFT' },
    },
    ISSUED: {
      title: '견적서 발행 완료',
      editable: false,
      showSignature: false,
    },
    PO_ISSUED: {
      title: '받은 PO 확인',
      editable: false,
      showSignature: true,
      primaryAction: { label: '서명 후 확정', action: 'SIGN_PO' },
    },
    REJECTED: {
      title: '반려된 견적',
      editable: false,
      showSignature: false,
    },
    PO_CONFIRMED: {
      title: '확정 PO',
      editable: false,
      showSignature: false,
      primaryAction: { label: '인보이스 발행', action: 'ISSUE_INVOICE' },
    },
    INVOICE_ISSUED: {
      title: '인보이스 발행 완료',
      editable: false,
      showSignature: false,
    },
  },
  CLIENT: {
    ISSUED: {
      title: '견적서 확인',
      editable: false,
      showSignature: false,
      primaryAction: { label: '발주하기', action: 'START_PO' },
      secondaryAction: { label: '반려', action: 'REJECT_QUOTE' },
    },
    PO_DRAFT: {
      title: '발주서 작성',
      editable: true,
      showSignature: true,
      primaryAction: { label: '발주서 발행', action: 'ISSUE_PO' },
    },
    PO_ISSUED: {
      title: '발주서 발행 완료',
      editable: false,
      showSignature: false,
    },
    REJECTED: {
      title: '반려 완료',
      editable: false,
      showSignature: false,
    },
    PO_CONFIRMED: {
      title: '확정 PO',
      editable: false,
      showSignature: false,
    },
    INVOICE_ISSUED: {
      title: '인보이스 수신',
      editable: false,
      showSignature: false,
    },
  },
};