import type { QuoteAction, QuoteDocument, QuoteStatus } from '@/types/documents/document';
import { getQuoteById, saveQuote, updateQuoteStatus } from '@/lib/documents/quote-store';

type TransitionResult =
  | { ok: true; quote: QuoteDocument }
  | { ok: false; error: string };

const TRANSITIONS: Record<
  QuoteAction,
  Partial<Record<QuoteStatus, QuoteStatus>>
> = {
  ISSUE_QUOTE: { DRAFT: 'ISSUED' },
  REJECT_QUOTE: { ISSUED: 'REJECTED' },
  START_PO: { ISSUED: 'PO_DRAFT' },
  ISSUE_PO: { PO_DRAFT: 'PO_ISSUED' },
  SIGN_PO: { PO_ISSUED: 'PO_CONFIRMED' },
  CONFIRM_PO: { PO_ISSUED: 'PO_CONFIRMED' },
  ISSUE_INVOICE: { PO_CONFIRMED: 'INVOICE_ISSUED' },
};

/** MVP: 서버/API 대체 단일 진입점 */
export function executeQuoteAction(
  quoteId: string,
  action: QuoteAction,
  patch?: Partial<QuoteDocument>
): TransitionResult {
  const quote = getQuoteById(quoteId);
  if (!quote) return { ok: false, error: '견적서를 찾을 수 없습니다.' };

  if (patch) {
    saveQuote({ ...quote, ...patch });
  }

  const current = getQuoteById(quoteId)!;
  const nextStatus = TRANSITIONS[action][current.status];

  if (!nextStatus) {
    return { ok: false, error: `현재 상태(${current.status})에서 ${action} 할 수 없습니다.` };
  }

  if (action === 'SIGN_PO' || action === 'CONFIRM_PO') {
    const party = action === 'SIGN_PO' ? ('SUPPLIER' as const) : ('CLIENT' as const);
    const signerName =
      party === 'SUPPLIER' ? current.supplier.companyName : current.client.companyName;
    const signed = {
      ...current,
      status: nextStatus,
      signatures: [
        ...current.signatures,
        {
          party,
          signedAt: new Date().toISOString(),
          signerName,
        },
      ],
    };
    saveQuote(signed);
    return { ok: true, quote: signed };
  }

  if (action === 'ISSUE_PO') {
    const issued = {
      ...current,
      status: nextStatus,
      signatures: [
        ...current.signatures,
        {
          party: 'CLIENT' as const,
          signedAt: new Date().toISOString(),
          signerName: current.client.companyName,
        },
      ],
    };
    saveQuote(issued);
    return { ok: true, quote: issued };
  }

  const updated = updateQuoteStatus(quoteId, nextStatus);
  if (!updated) return { ok: false, error: '상태 변경에 실패했습니다.' };
  return { ok: true, quote: updated };
}
