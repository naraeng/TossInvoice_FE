'use client';

import { PoDeliverySection } from '@/features/documents/quote/client/components/PoDeliverySection';
import { PoDraftHeader } from '@/features/documents/quote/client/components/PoDraftHeader';
import { PoSignatureSection } from '@/features/documents/quote/client/components/PoSignatureSection';
import { PurchaseOrderDocument } from '@/features/documents/quote/client/components/PurchaseOrderDocument';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  onDeliveryDateChange: (value: string) => void;
  onShippingAddressChange: (value: string) => void;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

export function ClientQuotePoDraftScreen({
  quote,
  onDeliveryDateChange,
  onShippingAddressChange,
  onSignatureChange,
}: Props) {
  return (
    <div className="space-y-5">
      <PoDraftHeader quote={quote} />
      <article className="overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <PurchaseOrderDocument quote={quote} />
        <PoDeliverySection
          deliveryDate={quote.deliveryDate}
          shippingAddress={quote.shippingAddress}
          onDeliveryDateChange={onDeliveryDateChange}
          onShippingAddressChange={onShippingAddressChange}
        />
        <PoSignatureSection quote={quote} onSignatureChange={onSignatureChange} />
      </article>
    </div>
  );
}
