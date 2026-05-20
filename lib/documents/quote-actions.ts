import { findSignature, upsertSignature } from '@/lib/documents/signature-utils';
import type { QuoteAction, QuoteDocument, QuoteStatus } from '@/types/documents/document';
import { enrichIssuedQuote } from '@/lib/documents/enrich-issued-quote';
import { enrichPoDraft } from '@/lib/documents/enrich-po-draft';
import { enrichInvoiceIssued } from '@/lib/documents/enrich-invoice-issued';
import { enrichPoIssued } from '@/lib/documents/enrich-po-issued';
import {
  getQuoteById,
  saveQuote,
  updateQuoteStatus,
  upsertQuoteFromPatch,
} from '@/lib/documents/quote-store';

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
  let quote = getQuoteById(quoteId);

  if (!quote && patch) {
    upsertQuoteFromPatch(quoteId, patch);
    quote = getQuoteById(quoteId);
  }

  if (!quote) {
    return { ok: false, error: '견적서를 찾을 수 없습니다.' };
  }

  if (patch) {
    saveQuote({ ...quote, ...patch, id: quoteId });
  }

  const stored = getQuoteById(quoteId)!;
  // patch에 더 진행된 상태가 있으면 우선 (클라이언트·서버 동기화 직후)
  const current =
    patch?.status && patch.status !== stored.status
      ? ({ ...stored, ...patch, id: quoteId } as QuoteDocument)
      : stored;
  const nextStatus = TRANSITIONS[action][current.status];

  if (!nextStatus) {
    return { ok: false, error: `현재 상태(${current.status})에서 ${action} 할 수 없습니다.` };
  }

  if (action === 'SIGN_PO' || action === 'CONFIRM_PO') {
    const party = action === 'SIGN_PO' ? ('SUPPLIER' as const) : ('CLIENT' as const);
    const scope = 'PO' as const;
    const merged = patch ? ({ ...current, ...patch, id: quoteId } as QuoteDocument) : current;
    const signerName =
      party === 'SUPPLIER'
        ? (merged.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ??
            merged.supplier.companyName ??
            '')
        : (merged.clientProfile?.representative.replace(/\s*대표\s*$/, '') ??
            merged.client.companyName ??
            '');
    const draftPoSig = findSignature(merged, party, scope);
    const signed = {
      ...merged,
      status: nextStatus,
      signatures: upsertSignature(merged.signatures, {
        party,
        scope,
        signedAt: new Date().toISOString(),
        signerName: draftPoSig?.signerName ?? signerName,
        signatureImage: draftPoSig?.signatureImage,
      }),
    };
    saveQuote(signed);
    return { ok: true, quote: signed };
  }

  if (action === 'ISSUE_QUOTE') {
    const issued = enrichIssuedQuote({ ...current, ...(patch ?? {}) });
    saveQuote(issued);
    return { ok: true, quote: issued };
  }

  if (action === 'START_PO') {
    const poDraft = enrichPoDraft({ ...current, ...(patch ?? {}) });
    saveQuote(poDraft);
    return { ok: true, quote: poDraft };
  }

  if (action === 'ISSUE_PO') {
    const issued = enrichPoIssued({ ...current, ...(patch ?? {}) });
    saveQuote(issued);
    return { ok: true, quote: issued };
  }

  if (action === 'ISSUE_INVOICE') {
    const issued = enrichInvoiceIssued({ ...current, ...(patch ?? {}) });
    saveQuote(issued);
    return { ok: true, quote: issued };
  }

  const updated = updateQuoteStatus(quoteId, nextStatus);
  if (!updated) return { ok: false, error: '상태 변경에 실패했습니다.' };
  return { ok: true, quote: updated };
}
