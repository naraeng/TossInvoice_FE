import type { QuoteDocument } from '@/types/documents/document';

function buildInvoiceDocumentNo(baseDate: string) {
  const compact = baseDate.replace(/-/g, '');
  return `INV-${compact.slice(0, 4)}-${compact.slice(4, 6)}${compact.slice(6, 8)}-001`;
}

/** PO_CONFIRMED → invoice 작성 화면 진입 시 필드 보강 */
export function enrichInvoiceDraft(quote: QuoteDocument): QuoteDocument {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  return {
    ...quote,
    invoiceDocumentNo: quote.invoiceDocumentNo ?? buildInvoiceDocumentNo(today),
    invoiceIssuedAt: quote.invoiceIssuedAt ?? now.toISOString(),
    poDocumentNo: quote.poDocumentNo,
    piDocumentNo: quote.piDocumentNo ?? quote.documentNo,
    courier: quote.courier ?? 'CJ대한통운',
    shipmentDate: quote.shipmentDate ?? today,
    arrivalConfirmedAt:
      quote.arrivalConfirmedAt ?? new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
  };
}
