import { InvoicePaymentProgress } from '@/features/documents/invoice/supplier/components/InvoicePaymentProgress';
import { InvoiceShippingSection } from '@/features/documents/invoice/supplier/components/InvoiceShippingSection';
import { InvoiceSignatureSection } from '@/features/documents/invoice/supplier/components/InvoiceSignatureSection';
import { TransactionStatementDocument } from '@/features/documents/invoice/supplier/components/TransactionStatementDocument';
import { SupplierInvoiceIssuedHeader } from '@/features/documents/invoice/supplier/SupplierInvoiceIssuedHeader';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  trackingNumber: string;
};

export function SupplierInvoiceIssuedScreen({ quote, trackingNumber }: Props) {
  return (
    <div className="space-y-5">
      <SupplierInvoiceIssuedHeader quote={quote} />
      <article className="overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <TransactionStatementDocument quote={quote} trackingNumber={trackingNumber}>
          <InvoiceShippingSection quote={quote} trackingNumber={trackingNumber} readOnly />
          <InvoicePaymentProgress quote={quote} />
          <InvoiceSignatureSection quote={quote} issued />
        </TransactionStatementDocument>
      </article>
    </div>
  );
}
