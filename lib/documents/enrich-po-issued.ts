import { DEFAULT_CLIENT_PROFILE } from '@/lib/documents/enrich-issued-quote';
import type { QuoteDocument } from '@/types/documents/document';

/** PO_DRAFT → PO_ISSUED 전환 시 발주서 발행 필드 보강 */
export function enrichPoIssued(quote: QuoteDocument): QuoteDocument {
  const now = new Date();
  const clientProfile = quote.clientProfile ?? DEFAULT_CLIENT_PROFILE;
  const signerName = clientProfile.representative.replace(/\s*대표\s*$/, '');

  const deliveryLabel = quote.deliveryDate
    ? `${quote.deliveryDate.replace(/-/g, '.')} (발주처 확정)`
    : quote.transactionTerms?.deliverySchedule ?? '발주처 확정일 미입력';

  const withoutPoClient = quote.signatures.filter(
    (s) => !(s.party === 'CLIENT' && (s.scope === 'PO' || !s.scope))
  );
  const draftClientSig = quote.signatures.find(
    (s) => s.party === 'CLIENT' && (s.scope === 'PO' || s.signatureImage)
  );

  return {
    ...quote,
    status: 'PO_ISSUED',
    piDocumentNo: quote.piDocumentNo ?? quote.documentNo,
    poIssuedAt: now.toISOString(),
    transactionToken:
      quote.transactionToken ??
      `TX-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${quote.id.slice(-4).toUpperCase()}`,
    transactionTerms: {
      paymentMethod:
        quote.transactionTerms?.paymentMethod ??
        '안전결제 (선금 30% PO 합의 시 / 잔금 70% 납품 확인 시)',
      deliverySchedule: deliveryLabel,
    },
    signatures: [
      ...withoutPoClient,
      {
        party: 'CLIENT',
        scope: 'PO',
        signedAt: now.toISOString(),
        signerName: draftClientSig?.signerName ?? signerName,
        ipAddress: '203.241.128.99',
        signatureImage: draftClientSig?.signatureImage,
      },
    ],
  };
}
