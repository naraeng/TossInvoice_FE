import { PoConfirmedSignatures } from '@/features/documents/quote/client/components/PoConfirmedSignatures';
import { PurchaseOrderDocument } from '@/features/documents/quote/client/components/PurchaseOrderDocument';
import { ClientQuotePoConfirmedHeader } from '@/features/documents/quote/client/ClientQuotePoConfirmedHeader';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function ClientQuotePoConfirmedScreen({ quote }: Props) {
  return (
    <div className="space-y-5">
      <ClientQuotePoConfirmedHeader quote={quote} />
      <article className="overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <PurchaseOrderDocument quote={quote} variant="issued">
          <PoConfirmedSignatures quote={quote} />
        </PurchaseOrderDocument>
      </article>
    </div>
  );
}
