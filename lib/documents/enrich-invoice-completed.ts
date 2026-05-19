import {
  getInvoiceClientSignature,
  getInvoiceSupplierSignature,
  upsertSignature,
} from '@/lib/documents/signature-utils';
import type { QuoteDocument } from '@/types/documents/document';

/** 거래 완료 — 양측 보관용 최종 invoice */
export function enrichInvoiceCompleted(quote: QuoteDocument): QuoteDocument {
  const now = new Date().toISOString();
  const supplierSig = getInvoiceSupplierSignature(quote);
  const clientSig = getInvoiceClientSignature(quote);
  const supplierName =
    quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규';
  const clientName =
    quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ?? '김민수';

  let signatures = quote.signatures;

  if (!supplierSig) {
    signatures = upsertSignature(signatures, {
      party: 'SUPPLIER',
      scope: 'INVOICE',
      signedAt: quote.invoiceIssuedAt ?? now,
      signerName: supplierName,
      ipAddress: '203.241.128.45',
    });
  }

  if (!clientSig) {
    signatures = upsertSignature(signatures, {
      party: 'CLIENT',
      scope: 'INVOICE',
      signedAt: now,
      signerName: clientName,
      ipAddress: '203.241.99.12',
    });
  }

  return {
    ...quote,
    status: 'INVOICE_COMPLETED',
    balancePaidAt: quote.balancePaidAt ?? now,
    depositPaidAt: quote.depositPaidAt ?? quote.poIssuedAt ?? quote.issuedAt,
    arrivalConfirmedAt: quote.arrivalConfirmedAt ?? now,
    signatures,
  };
}
