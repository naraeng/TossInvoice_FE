import type { QuoteStatus } from '@/types/documents/document';

export const TRANSACTION_STEPS = [
  {
    key: 'PI',
    label: 'PI 견적서',
    statuses: ['ISSUED', 'REJECTED'] as QuoteStatus[],
    supplierSub: '발행 완료 · 발주처 검토 중',
    clientSub: '수신 · 검토 중',
  },
  {
    key: 'PO',
    label: 'PO 발주서',
    statuses: ['PO_DRAFT', 'PO_ISSUED'] as QuoteStatus[],
    supplierSub: '발주처 확정 후 발행',
    clientSub: '발주처가 확정 후 발행',
  },
  {
    key: 'INVOICE',
    label: '최종 invoice',
    statuses: ['PO_CONFIRMED', 'INVOICE_ISSUED', 'INVOICE_COMPLETED'] as QuoteStatus[],
    supplierSub: '납품 완료 후 발행',
    clientSub: '납품 완료 후 발행',
  },
] as const;

export const PROTECTION_STATUS_ITEMS = [
  '거래 토큰 활성화',
  '발주처 계좌 검증 완료',
  '납품 확인 시 잔금 자동 송금',
] as const;
