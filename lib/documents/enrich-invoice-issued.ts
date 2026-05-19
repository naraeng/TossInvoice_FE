import { getPoSupplierSignature, upsertSignature } from '@/lib/documents/signature-utils';
import type { QuoteDocument } from '@/types/documents/document';

/** PO_CONFIRMED → INVOICE_ISSUED */
export function enrichInvoiceIssued(quote: QuoteDocument): QuoteDocument {
  const now = new Date();
  const poSupplier = getPoSupplierSignature(quote);
  const signerName =
    quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규';

  return {
    ...quote,
    status: 'INVOICE_ISSUED',
    invoiceIssuedAt: now.toISOString(),
    signatures: upsertSignature(quote.signatures, {
      party: 'SUPPLIER',
      scope: 'INVOICE',
      signedAt: now.toISOString(),
      signerName: poSupplier?.signerName ?? signerName,
      ipAddress: '203.241.128.45',
      signatureImage: poSupplier?.signatureImage,
    }),
  };
}
