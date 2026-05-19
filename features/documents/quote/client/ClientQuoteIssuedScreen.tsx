import { ProformaInvoiceDocument } from '@/features/documents/quote/shared/ProformaInvoiceDocument';
import { QuoteIssuedHeader } from '@/features/documents/quote/shared/QuoteIssuedHeader';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function ClientQuoteIssuedScreen({ quote }: Props) {
  return (
    <>
      <QuoteIssuedHeader quote={quote} viewerRole="CLIENT" />
      <ProformaInvoiceDocument quote={quote} />
    </>
  );
}
