'use client';

import { useEffect, useState } from 'react';

import { ClientSection } from '@/features/documents/quote/supplier/components/ClientSection';
import { PaymentSection } from '@/features/documents/quote/supplier/components/PaymentSection';
import { QuoteDraftHeader } from '@/features/documents/quote/supplier/components/QuoteDraftHeader';
import { QuoteItemsSection } from '@/features/documents/quote/supplier/components/QuoteItemsSection';
import { ScheduleSection } from '@/features/documents/quote/supplier/components/ScheduleSection';
import { SignaturePadSection } from '@/features/documents/quote/supplier/components/SignaturePadSection';
import { MOCK_CLIENTS, type MockClient } from '@/features/documents/quote/supplier/constants';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  lastSavedLabel?: string;
  onItemsChange: (items: QuoteDocument['items']) => void;
  onClientChange: (client: MockClient) => void;
  onSignatureChange?: (signed: boolean) => void;
};

export function SupplierQuoteDraftScreen({
  quote,
  lastSavedLabel,
  onItemsChange,
  onClientChange,
  onSignatureChange,
}: Props) {
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(() => {
    const match = MOCK_CLIENTS.find((c) => c.name === quote.client.companyName);
    return match?.id ?? MOCK_CLIENTS[0]?.id;
  });

  useEffect(() => {
    const match = MOCK_CLIENTS.find((c) => c.name === quote.client.companyName);
    // if (match) setSelectedClientId(match.id);
  }, [quote.client.companyName]);

  const handleSelectClient = (client: MockClient) => {
    setSelectedClientId(client.id);
    onClientChange(client);
  };

  return (
    <>
      <QuoteDraftHeader lastSavedLabel={lastSavedLabel} />

      <article className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <div className="divide-y divide-slate-100 px-5 sm:px-8">
          <ClientSection selectedClientId={selectedClientId} onSelect={handleSelectClient} />
          <QuoteItemsSection items={quote.items} totals={quote.totals} onChange={onItemsChange} />
          <PaymentSection totals={quote.totals} />
          <ScheduleSection />
          <SignaturePadSection onSigned={onSignatureChange} />
        </div>
      </article>
    </>
  );
}
