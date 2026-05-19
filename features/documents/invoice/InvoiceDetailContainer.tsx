'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { DocumentShell } from '@/components/documents/DocumentShell';
import { SupplierInvoiceDraftScreen } from '@/features/documents/invoice/supplier/SupplierInvoiceDraftScreen';
import { SupplierInvoiceDraftSidebar } from '@/features/documents/invoice/supplier/SupplierInvoiceDraftSidebar';
import { InvoiceCompletedScreen } from '@/features/documents/invoice/shared/InvoiceCompletedScreen';
import { InvoiceCompletedSidebar } from '@/features/documents/invoice/shared/InvoiceCompletedSidebar';
import { SupplierInvoiceIssuedScreen } from '@/features/documents/invoice/supplier/SupplierInvoiceIssuedScreen';
import { SupplierInvoiceIssuedSidebar } from '@/features/documents/invoice/supplier/SupplierInvoiceIssuedSidebar';
import { enrichInvoiceDraft } from '@/lib/documents/enrich-invoice-draft';
import { saveQuote } from '@/lib/documents/quote-store';
import {
  getInvoiceSupplierSignature,
  upsertSignature,
} from '@/lib/documents/signature-utils';
import { syncQuoteViaApi } from '@/lib/documents/sync-quote-client';
import { fetchTradeDetail } from '@/lib/trades/fetch-trade-detail';
import { getIssueInvoiceErrorMessage } from '@/lib/trades/issue-invoice-errors';
import { issueInvoice } from '@/lib/trades/issue-invoice';
import { mapTradeDetailToQuote } from '@/lib/trades/map-trade-to-quote';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

function mergeDraftInvoiceSignature(mapped: QuoteDocument, draft: QuoteDocument): QuoteDocument {
  if (getInvoiceSupplierSignature(mapped)?.signatureImage) {
    return mapped;
  }

  const draftSig = getInvoiceSupplierSignature(draft);
  if (!draftSig?.signatureImage) {
    return mapped;
  }

  return {
    ...mapped,
    signatures: upsertSignature(mapped.signatures, draftSig),
  };
}

export function InvoiceDetailContainer({ quote: initialQuote }: Props) {
  const router = useRouter();
  const [quote, setQuote] = useState(() => enrichInvoiceDraft(initialQuote));
  const [trackingNumber, setTrackingNumber] = useState(() => quote.trackingNumber ?? '');
  const [hasInvoiceSignature, setHasInvoiceSignature] = useState(
    () => !!getInvoiceSupplierSignature(quote)?.signatureImage,
  );
  const [busy, setBusy] = useState(false);
  const [prevInitialQuote, setPrevInitialQuote] = useState(initialQuote);

  const isIssued = quote.status === 'INVOICE_ISSUED';
  const isCompleted = quote.status === 'INVOICE_COMPLETED';

  if (initialQuote !== prevInitialQuote) {
    const next =
      initialQuote.status === 'INVOICE_ISSUED' || initialQuote.status === 'INVOICE_COMPLETED'
        ? initialQuote
        : enrichInvoiceDraft(initialQuote);
    setPrevInitialQuote(initialQuote);
    setQuote(next);
    setTrackingNumber(next.trackingNumber ?? '');
    setHasInvoiceSignature(!!getInvoiceSupplierSignature(next)?.signatureImage);
  }

  useEffect(() => {
    if (initialQuote.status === 'PO_CONFIRMED') {
      saveQuote(enrichInvoiceDraft(initialQuote));
    }
  }, [initialQuote]);

  const persist = useCallback((next: QuoteDocument) => {
    setQuote(next);
    saveQuote(next);
  }, []);

  const handleTrackingChange = (value: string) => {
    setTrackingNumber(value);
    persist({ ...quote, trackingNumber: value || undefined });
  };

  const handleInvoiceSignature = useCallback(
    (signed: boolean, imageDataUrl?: string) => {
      setHasInvoiceSignature(signed);
      const signerName =
        quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규';

      if (!signed || !imageDataUrl) {
        persist({
          ...quote,
          signatures: quote.signatures.filter(
            (s) => !(s.party === 'SUPPLIER' && s.scope === 'INVOICE'),
          ),
        });
        return;
      }

      persist({
        ...quote,
        signatures: upsertSignature(quote.signatures, {
          party: 'SUPPLIER',
          scope: 'INVOICE',
          signedAt: new Date().toISOString(),
          signerName,
          signatureImage: imageDataUrl,
        }),
      });
    },
    [quote, persist],
  );

  const handleIssueInvoice = async () => {
    const tradeId = quote.tradeId;
    if (tradeId == null) {
      alert('연결된 거래 정보가 없습니다.');
      return;
    }

    const signatureImage = getInvoiceSupplierSignature(quote)?.signatureImage;

    if (!signatureImage) {
      alert('서명 이미지가 필요합니다.');
      return;
    }

    setBusy(true);
    try {
      await issueInvoice(tradeId, quote, trackingNumber, signatureImage);
      const detail = await fetchTradeDetail(tradeId);
      const tracking = trackingNumber.trim() || undefined;
      const nextQuote = mergeDraftInvoiceSignature(
        {
          ...mapTradeDetailToQuote(detail),
          viewerRoleHint: 'SUPPLIER' as const,
          trackingNumber: tracking,
        },
        quote,
      );

      await syncQuoteViaApi(nextQuote);
      setQuote(nextQuote);
      setTrackingNumber(nextQuote.trackingNumber ?? tracking ?? '');
      setHasInvoiceSignature(!!getInvoiceSupplierSignature(nextQuote)?.signatureImage);
      saveQuote(nextQuote);
    } catch (error: unknown) {
      alert(getIssueInvoiceErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (isCompleted) {
    return (
      <DocumentShell
        variant="draft"
        sidebar={
          <InvoiceCompletedSidebar
            quote={quote}
            busy={busy}
            contactLabel="발주처에 문의"
            onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
            onContact={() => alert('발주처 문의 채널로 연결됩니다.')}
            onBackToTrade={() => router.push('/trade')}
          />
        }
      >
        <InvoiceCompletedScreen quote={quote} />
      </DocumentShell>
    );
  }

  if (isIssued) {
    const issuedTracking = quote.trackingNumber ?? trackingNumber;

    return (
      <DocumentShell
        variant="draft"
        sidebar={
          <SupplierInvoiceIssuedSidebar
            quote={quote}
            busy={busy}
            onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
            onContactClient={() => alert('발주처 문의 채널로 연결됩니다.')}
            onBackToTrade={() => router.push('/trade')}
          />
        }
      >
        <SupplierInvoiceIssuedScreen quote={quote} trackingNumber={issuedTracking} />
      </DocumentShell>
    );
  }

  if (quote.status !== 'PO_CONFIRMED') {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">PO 확정 후 인보이스를 작성할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <DocumentShell
      variant="draft"
      sidebar={
        <SupplierInvoiceDraftSidebar
          quote={quote}
          busy={busy}
          canIssue={!!trackingNumber.trim() && hasInvoiceSignature}
          onIssueInvoice={() => void handleIssueInvoice()}
          onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
          onContactClient={() => alert('발주처 문의 채널로 연결됩니다.')}
        />
      }
    >
      <SupplierInvoiceDraftScreen
        quote={quote}
        trackingNumber={trackingNumber}
        onTrackingNumberChange={handleTrackingChange}
        onSignatureChange={handleInvoiceSignature}
        hasInvoiceSignature={hasInvoiceSignature}
      />
    </DocumentShell>
  );
}
