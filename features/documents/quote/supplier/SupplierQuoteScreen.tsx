import { QuoteDocumentBody } from '@/components/documents/QuoteDocumentBody';
import type { QuoteDocument } from '@/types/documents/document';

import { SupplierQuoteDraftScreen } from './SupplierQuoteDraftScreen';
import { SupplierQuoteIssuedScreen } from './SupplierQuoteIssuedScreen';
import { InvoiceCompletedScreen } from '@/features/documents/invoice/shared/InvoiceCompletedScreen';
import { SupplierInvoiceIssuedScreen } from '@/features/documents/invoice/supplier/SupplierInvoiceIssuedScreen';
import { SupplierQuotePoConfirmedScreen } from './SupplierQuotePoConfirmedScreen';
import { SupplierQuotePoIssuedScreen } from './SupplierQuotePoIssuedScreen';
import type { QuoteSchedule } from '@/lib/documents/schedule';

import type { ClientCompany } from './constants';

type Props = {
  quote: QuoteDocument;
  editable: boolean;
  showSignature: boolean;
  lastSavedLabel?: string;
  onItemsChange?: (items: QuoteDocument['items']) => void;
  onClientChange?: (client: ClientCompany) => void;
  onDownPaymentPercentChange?: (percent: number) => void;
  onScheduleChange?: (patch: Partial<QuoteSchedule>) => void;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
  /** PO_ISSUED 단계에서 수주처가 confirmedDeliveryDate를 정할 때 사용. */
  onDeliveryDateChange?: (value: string) => void;
};

export function SupplierQuoteScreen({
  quote,
  editable,
  showSignature,
  lastSavedLabel,
  onItemsChange,
  onClientChange,
  onDownPaymentPercentChange,
  onScheduleChange,
  onSignatureChange,
  onDeliveryDateChange,
}: Props) {
  if (quote.status === 'ISSUED') {
    return <SupplierQuoteIssuedScreen quote={quote} />;
  }

  if (quote.status === 'PO_ISSUED') {
    return (
      <SupplierQuotePoIssuedScreen
        quote={quote}
        onSignatureChange={onSignatureChange}
        onDeliveryDateChange={onDeliveryDateChange}
      />
    );
  }

  if (quote.status === 'PO_CONFIRMED') {
    return <SupplierQuotePoConfirmedScreen quote={quote} />;
  }

  if (quote.status === 'INVOICE_COMPLETED') {
    return <InvoiceCompletedScreen quote={quote} />;
  }

  if (quote.status === 'INVOICE_ISSUED') {
    return (
      <SupplierInvoiceIssuedScreen
        quote={quote}
        trackingNumber={quote.trackingNumber ?? ''}
      />
    );
  }

  if (
    quote.status === 'DRAFT' &&
    editable &&
    onItemsChange &&
    onClientChange &&
    onDownPaymentPercentChange &&
    onScheduleChange
  ) {
    return (
      <SupplierQuoteDraftScreen
        quote={quote}
        lastSavedLabel={lastSavedLabel}
        onItemsChange={onItemsChange}
        onClientChange={onClientChange}
        onDownPaymentPercentChange={onDownPaymentPercentChange}
        onScheduleChange={onScheduleChange}
        onSignatureChange={onSignatureChange}
      />
    );
  }

  return (
    <div className="space-y-4">
      {quote.status === 'DRAFT' && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          품목과 단가를 입력한 뒤 사이드바에서 견적서를 발행하세요.
        </p>
      )}
      <QuoteDocumentBody
        quote={quote}
        editable={editable}
        showSignature={showSignature}
        signatureRole="SUPPLIER"
        onItemsChange={onItemsChange}
      />
    </div>
  );
}
