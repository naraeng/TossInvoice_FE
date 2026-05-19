import type { QuoteDocument } from '@/types/documents/document';

import { InvoiceCompletedScreen } from '@/features/documents/invoice/shared/InvoiceCompletedScreen';
import { ClientQuoteInvoiceIssuedScreen } from './ClientQuoteInvoiceIssuedScreen';
import { ClientQuoteIssuedScreen } from './ClientQuoteIssuedScreen';
import { ClientQuotePoConfirmedScreen } from './ClientQuotePoConfirmedScreen';
import { ClientQuotePoDraftScreen } from './ClientQuotePoDraftScreen';
import { ClientQuotePoIssuedScreen } from './ClientQuotePoIssuedScreen';

type Props = {
  quote: QuoteDocument;
  editable: boolean;
  showSignature: boolean;
  onItemsChange?: (items: QuoteDocument['items']) => void;
  onDeliveryDateChange?: (value: string) => void;
  onShippingAddressChange?: (value: string) => void;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
  hasClientInvoiceSignature?: boolean;
  onInvoiceSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

export function ClientQuoteScreen({
  quote,
  onDeliveryDateChange,
  onShippingAddressChange,
  onSignatureChange,
  hasClientInvoiceSignature,
  onInvoiceSignatureChange,
}: Props) {
  if (quote.status === 'ISSUED') {
    return <ClientQuoteIssuedScreen quote={quote} />;
  }

  if (quote.status === 'PO_ISSUED') {
    return <ClientQuotePoIssuedScreen quote={quote} />;
  }

  if (quote.status === 'PO_CONFIRMED') {
    return <ClientQuotePoConfirmedScreen quote={quote} />;
  }

  if (quote.status === 'INVOICE_COMPLETED') {
    return <InvoiceCompletedScreen quote={quote} />;
  }

  if (quote.status === 'INVOICE_ISSUED') {
    return (
      <ClientQuoteInvoiceIssuedScreen
        quote={quote}
        hasClientInvoiceSignature={hasClientInvoiceSignature}
        onInvoiceSignatureChange={onInvoiceSignatureChange}
      />
    );
  }

  if (quote.status === 'PO_DRAFT') {
    if (!onDeliveryDateChange || !onShippingAddressChange) {
      return null;
    }
    return (
      <ClientQuotePoDraftScreen
        quote={quote}
        onDeliveryDateChange={onDeliveryDateChange}
        onShippingAddressChange={onShippingAddressChange}
        onSignatureChange={onSignatureChange}
      />
    );
  }

  if (quote.status === 'REJECTED') {
    return (
      <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
        이 견적은 반려되었습니다. 수주처에 재견적을 요청할 수 있습니다.
      </p>
    );
  }

  return (
    <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
      현재 상태({quote.status}) 화면은 준비 중입니다.
    </p>
  );
}
