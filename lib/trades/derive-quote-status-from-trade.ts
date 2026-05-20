import type { QuoteStatus } from '@/types/documents/document';

import type { TradeDetailResult } from './trade-detail-types';

function hasBuyerPoSignature(po: TradeDetailResult['purchaseOrder']): boolean {
  if (!po) return false;
  return Boolean(po.buyerSignatureUrl || po.buyerSignedAt);
}

/**
 * 명세 「화면 라우팅 derive 규칙」— backend status + PO/Invoice 존재 여부만으로 결정
 * (role-perspective 분기는 화면 layer에서 처리)
 */
export function deriveQuoteStatusFromTrade(detail: TradeDetailResult): QuoteStatus {
  const { status, purchaseOrder: po, invoice: inv } = detail;

  if (status === 'CANCELLED') return 'REJECTED';

  if (status === 'COMPLETED') return 'INVOICE_COMPLETED';

  if (status === 'PENDING_BUYER_CONFIRM') return 'INVOICE_ISSUED';

  if (inv != null) return 'INVOICE_ISSUED';

  if (status === 'PENDING_INVOICE') return 'PO_CONFIRMED';

  if (status === 'PENDING_SELLER_SIGN') return 'PO_ISSUED';

  if (status === 'PENDING_PO') {
    // PO가 없으면 아직 발주처가 작성 중 아님 → PI 발행 상태
    if (!po) return 'ISSUED';
    // PO 객체는 있지만 발주처 서명 전 → 작성 중 (양측 모두 PO_DRAFT 진행)
    if (!hasBuyerPoSignature(po)) return 'PO_DRAFT';
    // 발주처 서명 완료 → PO_ISSUED (수주처 서명 대기)
    return 'PO_ISSUED';
  }

  return detail.proformaInvoice ? 'ISSUED' : 'DRAFT';
}
