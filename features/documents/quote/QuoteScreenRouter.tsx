import { ClientQuoteScreen } from '@/features/documents/quote/client/ClientQuoteScreen';
import { SupplierQuoteScreen } from '@/features/documents/quote/supplier/SupplierQuoteScreen';
import { getScreenConfig } from '@/lib/documents/get-screen-config';
import type { QuoteDocument, QuoteScreenProps, UserRole } from '@/types/documents/document';

import type { MockClient } from '@/features/documents/quote/supplier/constants';

export function QuoteScreenRouter({
  quote,
  viewerRole,
  editable,
  showSignature,
  lastSavedLabel,
  onItemsChange,
  onClientChange,
  onSignatureChange,
  onDeliveryDateChange,
  onShippingAddressChange,
}: QuoteScreenProps & {
  viewerRole: UserRole;
  lastSavedLabel?: string;
  onItemsChange?: (items: QuoteDocument['items']) => void;
  onClientChange?: (client: MockClient) => void;
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
      onSignatureChange={onSignatureChange}
    />
  );
}
