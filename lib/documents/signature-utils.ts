import type { QuoteDocument, SignatureRecord, SignatureScope, UserRole } from '@/types/documents/document';

export function getSignatureScope(sig: SignatureRecord): SignatureScope {
  if (sig.scope) return sig.scope;
  return sig.party === 'SUPPLIER' ? 'PI' : 'PO';
}

export function findSignature(
  quote: QuoteDocument,
  party: UserRole,
  scope: SignatureScope
): SignatureRecord | undefined {
  return quote.signatures.find(
    (s) => s.party === party && getSignatureScope(s) === scope
  );
}

export function getPiSupplierSignature(quote: QuoteDocument) {
  return findSignature(quote, 'SUPPLIER', 'PI');
}

export function getPoSupplierSignature(quote: QuoteDocument) {
  return findSignature(quote, 'SUPPLIER', 'PO');
}

export function getPoClientSignature(quote: QuoteDocument) {
  return findSignature(quote, 'CLIENT', 'PO');
}

export function getInvoiceSupplierSignature(quote: QuoteDocument) {
  return findSignature(quote, 'SUPPLIER', 'INVOICE');
}

export function upsertSignature(
  signatures: SignatureRecord[],
  next: SignatureRecord
): SignatureRecord[] {
  const scope = getSignatureScope(next);
  const rest = signatures.filter(
    (s) => !(s.party === next.party && getSignatureScope(s) === scope)
  );
  return [...rest, { ...next, scope }];
}
