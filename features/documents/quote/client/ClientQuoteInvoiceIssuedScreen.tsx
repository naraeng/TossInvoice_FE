'use client';

import { ClientInvoiceSignatureSection } from '@/features/documents/quote/client/components/ClientInvoiceSignatureSection';
import { InvoicePaymentProgress } from '@/features/documents/invoice/supplier/components/InvoicePaymentProgress';
import { InvoiceShippingSection } from '@/features/documents/invoice/supplier/components/InvoiceShippingSection';
import { TransactionStatementDocument } from '@/features/documents/invoice/supplier/components/TransactionStatementDocument';
import { ClientQuoteInvoiceIssuedHeader } from '@/features/documents/quote/client/ClientQuoteInvoiceIssuedHeader';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  hasClientInvoiceSignature?: boolean;
  onInvoiceSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

export function ClientQuoteInvoiceIssuedScreen({
  quote,
  hasClientInvoiceSignature,
  onInvoiceSignatureChange,
}: Props) {
  const trackingNumber = quote.trackingNumber ?? '';

  return (
    <div className="space-y-5">
      <ClientQuoteInvoiceIssuedHeader quote={quote} />
      <article className="overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <TransactionStatementDocument quote={quote} trackingNumber={trackingNumber}>
          <InvoiceShippingSection quote={quote} trackingNumber={trackingNumber} readOnly />
          <InvoicePaymentProgress quote={quote} />
          <ClientInvoiceSignatureSection
            quote={quote}
            hasClientSignature={hasClientInvoiceSignature}
            onSignatureChange={onInvoiceSignatureChange}
          />
        </TransactionStatementDocument>
      </article>
    </div>
  );
}
