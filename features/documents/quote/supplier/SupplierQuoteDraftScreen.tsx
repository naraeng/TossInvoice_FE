'use client';

import { ClientSection } from '@/features/documents/quote/supplier/components/ClientSection';
import { PaymentSection } from '@/features/documents/quote/supplier/components/PaymentSection';
import { QuoteDraftHeader } from '@/features/documents/quote/supplier/components/QuoteDraftHeader';
import { QuoteItemsSection } from '@/features/documents/quote/supplier/components/QuoteItemsSection';
import { ScheduleSection } from '@/features/documents/quote/supplier/components/ScheduleSection';
import { SignaturePadSection } from '@/features/documents/quote/supplier/components/SignaturePadSection';
import type { ClientCompany } from '@/features/documents/quote/supplier/constants';
import { clientCompanyFromQuote } from '@/features/documents/quote/supplier/lib/client-from-quote';
import { resolveDownPaymentPercent } from '@/lib/documents/payment-terms';
import { resolveQuoteSchedule, type QuoteSchedule } from '@/lib/documents/schedule';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  lastSavedLabel?: string;
  onItemsChange: (items: QuoteDocument['items']) => void;
  onClientChange: (client: ClientCompany) => void;
  onDownPaymentPercentChange: (percent: number) => void;
  onScheduleChange: (patch: Partial<QuoteSchedule>) => void;
  onSignatureChange?: (signed: boolean, signatureDataUrl?: string) => void;
};

export function SupplierQuoteDraftScreen({
  quote,
  lastSavedLabel,
  onItemsChange,
  onClientChange,
  onDownPaymentPercentChange,
  onScheduleChange,
  onSignatureChange,
}: Props) {
  const selectedClient = clientCompanyFromQuote(quote);
  const downPaymentPercent = resolveDownPaymentPercent(quote);
  const schedule = resolveQuoteSchedule(quote);

  const handleSelectClient = (client: ClientCompany) => {
    onClientChange(client);
  };

  return (
    <>
      <QuoteDraftHeader lastSavedLabel={lastSavedLabel} />

      <article className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <div className="divide-y divide-slate-100 px-5 sm:px-8">
          <ClientSection selectedClientId={selectedClient?.id} onSelect={handleSelectClient} />
          <QuoteItemsSection items={quote.items} totals={quote.totals} onChange={onItemsChange} />
          <PaymentSection
            totals={quote.totals}
            downPaymentPercent={downPaymentPercent}
            onDownPaymentPercentChange={onDownPaymentPercentChange}
          />
          <ScheduleSection schedule={schedule} onChange={onScheduleChange} />
          <SignaturePadSection quote={quote} onSigned={onSignatureChange} />
        </div>
      </article>
    </>
  );
}
