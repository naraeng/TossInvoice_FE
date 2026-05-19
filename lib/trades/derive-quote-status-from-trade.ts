import type { TradeRole } from '@/features/trade/types';
import type { QuoteStatus } from '@/types/documents/document';

import type { TradeDetailResult } from './trade-detail-types';

function hasBuyerPoSignature(po: TradeDetailResult['purchaseOrder']): boolean {
  if (!po) return false;
  return Boolean(po.buyerSignatureUrl || po.buyerSignedAt);
}

/**
 * 명세 「화면 라우팅 derive 규칙」— status + role + PO/invoice 존재 여부
 */
/**
 * @param perspectiveRole 거래 목록 탭(수주중/발주중) 기준 역할 — API `role`과 동일해야 하나 탭 기준으로 고정
 */
export function deriveQuoteStatusFromTrade(
  detail: TradeDetailResult,
  perspectiveRole?: TradeRole,
): QuoteStatus {
  const { status, purchaseOrder: po, invoice: inv } = detail;
  const role = perspectiveRole ?? detail.role;

  if (status === 'CANCELLED') return 'REJECTED';

  if (status === 'COMPLETED') return 'INVOICE_COMPLETED';

  if (status === 'PENDING_BUYER_CONFIRM') return 'INVOICE_ISSUED';

  if (inv != null) return 'INVOICE_ISSUED';

  if (status === 'PENDING_INVOICE') return 'PO_CONFIRMED';

  if (status === 'PENDING_SELLER_SIGN') return 'PO_ISSUED';

  if (status === 'PENDING_PO') {
    if (role === 'BUYER') {
      if (!po) return 'ISSUED';
      if (!hasBuyerPoSignature(po)) return 'PO_DRAFT';
      return 'PO_ISSUED';
    }
    return 'ISSUED';
  }

  return detail.proformaInvoice ? 'ISSUED' : 'DRAFT';
}
