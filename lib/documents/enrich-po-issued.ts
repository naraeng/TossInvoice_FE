import { buildPaymentMethodLabel, resolveDownPaymentPercent } from '@/lib/documents/payment-terms';
import type { QuoteDocument } from '@/types/documents/document';

/** PO_DRAFT → PO_ISSUED 전환 시 발주서 발행 필드 보강 */
export function enrichPoIssued(quote: QuoteDocument): QuoteDocument {
  const now = new Date();
  // 실 프로필이 없으면 발주처 회사명으로 대체
  const signerName =
    quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ??
    quote.client.companyName;

  const deliveryLabel = quote.deliveryDate
    ? `${quote.deliveryDate.replace(/-/g, '.')} (발주처 확정)`
    : quote.transactionTerms?.deliverySchedule ?? '발주처 확정일 미입력';
  const downPaymentPercent = resolveDownPaymentPercent(quote);

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
        quote.transactionTerms?.paymentMethod ?? buildPaymentMethodLabel(downPaymentPercent),
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
