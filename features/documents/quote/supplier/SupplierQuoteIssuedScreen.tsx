import { ProformaInvoiceDocument } from '@/features/documents/quote/shared/ProformaInvoiceDocument';
import { QuoteIssuedHeader } from '@/features/documents/quote/shared/QuoteIssuedHeader';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function SupplierQuoteIssuedScreen({ quote }: Props) {
  return (
    <>
      <QuoteIssuedHeader quote={quote} viewerRole="SUPPLIER" />
      <ProformaInvoiceDocument quote={quote} />
    </>
  );
}
