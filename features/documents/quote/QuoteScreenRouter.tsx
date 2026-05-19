import { ClientQuoteScreen } from '@/features/documents/quote/client/ClientQuoteScreen';
import { SupplierQuoteScreen } from '@/features/documents/quote/supplier/SupplierQuoteScreen';
import { getScreenConfig } from '@/lib/documents/get-screen-config';
import type { QuoteDocument, QuoteScreenProps, UserRole } from '@/types/documents/document';

import type { ClientCompany } from '@/features/documents/quote/supplier/constants';
import type { QuoteSchedule } from '@/lib/documents/schedule';

export function QuoteScreenRouter({
  quote,
  viewerRole,
  editable,
  showSignature,
  lastSavedLabel,
  onItemsChange,
  onClientChange,
  onDownPaymentPercentChange,
  onScheduleChange,
  onSignatureChange,
  onDeliveryDateChange,
  onShippingAddressChange,
}: QuoteScreenProps & {
  viewerRole: UserRole;
  lastSavedLabel?: string;
  onItemsChange?: (items: QuoteDocument['items']) => void;
  onClientChange?: (client: ClientCompany) => void;
  onDownPaymentPercentChange?: (percent: number) => void;
  onScheduleChange?: (patch: Partial<QuoteSchedule>) => void;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
  onDeliveryDateChange?: (value: string) => void;
  onShippingAddressChange?: (value: string) => void;
}) {
  const config = getScreenConfig(viewerRole, quote.status);
  const isEditable = editable ?? config.editable;
  const showSig = showSignature ?? config.showSignature;

  if (viewerRole === 'CLIENT') {
    return (
      <ClientQuoteScreen
        quote={quote}
        editable={isEditable}
        showSignature={showSig}
        onItemsChange={onItemsChange}
        onDeliveryDateChange={onDeliveryDateChange}
        onShippingAddressChange={onShippingAddressChange}
        onSignatureChange={onSignatureChange}
      />
    );
  }

  return (
    <SupplierQuoteScreen
      quote={quote}
      editable={isEditable}
      showSignature={showSig}
      lastSavedLabel={lastSavedLabel}
      onItemsChange={onItemsChange}
      onClientChange={onClientChange}
      onDownPaymentPercentChange={onDownPaymentPercentChange}
      onScheduleChange={onScheduleChange}
      onSignatureChange={onSignatureChange}
    />
  );
}
