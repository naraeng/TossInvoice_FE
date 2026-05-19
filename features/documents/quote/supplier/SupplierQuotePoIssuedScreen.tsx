import { PoIssuedSignatures } from '@/features/documents/quote/client/components/PoIssuedSignatures';
import { PurchaseOrderDocument } from '@/features/documents/quote/client/components/PurchaseOrderDocument';
import { SupplierQuotePoIssuedHeader } from '@/features/documents/quote/supplier/SupplierQuotePoIssuedHeader';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

export function SupplierQuotePoIssuedScreen({ quote, onSignatureChange }: Props) {
  return (
    <div className="space-y-5">
      <SupplierQuotePoIssuedHeader quote={quote} />
      <article className="overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <PurchaseOrderDocument quote={quote} variant="issued">
          <PoIssuedSignatures
            quote={quote}
            viewerRole="SUPPLIER"
            onSupplierSignatureChange={onSignatureChange}
          />
        </PurchaseOrderDocument>
      </article>
    </div>
  );
}
