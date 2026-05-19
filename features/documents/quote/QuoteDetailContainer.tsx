'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { DocumentShell } from '@/components/documents/DocumentShell';
import { DocumentSidebar } from '@/features/documents/components/DocumentSidebar';
import { ClientQuoteIssuedSidebar } from '@/features/documents/quote/client/ClientQuoteIssuedSidebar';
import { ClientQuotePoDraftSidebar } from '@/features/documents/quote/client/ClientQuotePoDraftSidebar';
import { ClientQuoteInvoiceIssuedSidebar } from '@/features/documents/quote/client/ClientQuoteInvoiceIssuedSidebar';
import { ClientQuotePoConfirmedSidebar } from '@/features/documents/quote/client/ClientQuotePoConfirmedSidebar';
import { ClientQuotePoIssuedSidebar } from '@/features/documents/quote/client/ClientQuotePoIssuedSidebar';
import { SupplierQuotePoConfirmedSidebar } from '@/features/documents/quote/supplier/SupplierQuotePoConfirmedSidebar';
import { SupplierQuotePoIssuedSidebar } from '@/features/documents/quote/supplier/SupplierQuotePoIssuedSidebar';
import { QuoteScreenRouter } from '@/features/documents/quote/QuoteScreenRouter';
import { SupplierQuoteDraftSidebar } from '@/features/documents/quote/supplier/SupplierQuoteDraftSidebar';
import { SupplierQuoteIssuedSidebar } from '@/features/documents/quote/supplier/SupplierQuoteIssuedSidebar';
import type { ClientCompany } from '@/features/documents/quote/supplier/constants';
import { enrichIssuedQuote } from '@/lib/documents/enrich-issued-quote';
import { getScreenConfig } from '@/lib/documents/get-screen-config';
import { saveQuote } from '@/lib/documents/quote-store';
import { calcTotals } from '@/lib/documents/calc-totals';
import {
  clampDownPaymentPercent,
  formatPaymentTerms,
} from '@/lib/documents/payment-terms';
import {
  minValidityUntilDate,
  normalizePaymentDueDays,
  normalizeProductionDays,
  type QuoteSchedule,
} from '@/lib/documents/schedule';
import { getStartTradeErrorMessage } from '@/lib/trades/start-trade-errors';
import { startTrade } from '@/lib/trades/start-trade';
import {
  getPiSupplierSignature,
  getPoClientSignature,
  getPoSupplierSignature,
  upsertSignature,
} from '@/lib/documents/signature-utils';
import type { QuoteDocument, UserRole } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  viewerRole: UserRole;
};

function formatSavedLabel(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 10) return '방금';
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export function QuoteDetailContainer({ quote: initialQuote, viewerRole }: Props) {
  const router = useRouter();
  const [quote, setQuote] = useState(initialQuote);
  const [busy, setBusy] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(() => new Date());
  const [lastSavedLabel, setLastSavedLabel] = useState('방금');
  const [hasDraftSupplierSignature, setHasDraftSupplierSignature] = useState(false);
  const [hasClientPoSignature, setHasClientPoSignature] = useState(
    () => !!getPoClientSignature(quote)?.signatureImage
  );
  const [hasSupplierPoSignature, setHasSupplierPoSignature] = useState(
    () => !!getPoSupplierSignature(quote)?.signatureImage
  );

  const config = getScreenConfig(viewerRole, quote.status);
  const isDraftSupplier = viewerRole === 'SUPPLIER' && quote.status === 'DRAFT';
  const isIssued = quote.status === 'ISSUED';
  const isPoDraftClient = viewerRole === 'CLIENT' && quote.status === 'PO_DRAFT';
  const isPoIssued = quote.status === 'PO_ISSUED';
  const isPoConfirmed = quote.status === 'PO_CONFIRMED';
  const isPoIssuedSupplier = isPoIssued && viewerRole === 'SUPPLIER';
  const isPoConfirmedSupplier = isPoConfirmed && viewerRole === 'SUPPLIER';
  const isPoConfirmedClient = isPoConfirmed && viewerRole === 'CLIENT';
  const isInvoiceIssuedClient = quote.status === 'INVOICE_ISSUED' && viewerRole === 'CLIENT';
  const useWideLayout =
    isDraftSupplier ||
    isIssued ||
    isPoDraftClient ||
    isPoIssued ||
    isPoConfirmedSupplier ||
    isPoConfirmedClient ||
    isInvoiceIssuedClient;

  useEffect(() => {
    const tick = setInterval(() => {
      setLastSavedLabel(formatSavedLabel(lastSavedAt));
    }, 5000);
    return () => clearInterval(tick);
  }, [lastSavedAt]);

  const persist = useCallback((next: QuoteDocument) => {
    setQuote(next);
    saveQuote(next);
    const now = new Date();
    setLastSavedAt(now);
    setLastSavedLabel(formatSavedLabel(now));
  }, []);

  const handleItemsChange = (items: QuoteDocument['items']) => {
    persist({ ...quote, items, totals: calcTotals(items) });
  };

  const handleScheduleChange = (patch: Partial<QuoteSchedule>) => {
    persist({
      ...quote,
      ...('productionDays' in patch && {
        productionDays: normalizeProductionDays(patch.productionDays),
      }),
      ...('paymentDueDays' in patch && {
        paymentDueDays: normalizePaymentDueDays(patch.paymentDueDays),
      }),
      ...('validityUntil' in patch && {
        validityUntil:
          patch.validityUntil && patch.validityUntil < minValidityUntilDate()
            ? minValidityUntilDate()
            : patch.validityUntil || undefined,
      }),
    });
  };

  const handleDownPaymentPercentChange = (percent: number) => {
    const downPaymentPercent = clampDownPaymentPercent(percent);
    persist({
      ...quote,
      downPaymentPercent,
      paymentTerms: formatPaymentTerms(downPaymentPercent),
    });
  };

  const handleClientChange = (client: ClientCompany) => {
    persist({
      ...quote,
      client: {
        companyId: client.id,
        companyName: client.name,
        role: 'CLIENT',
      },
      clientProfile: {
        businessNo: client.businessNo,
        representative: client.representative,
        address: client.address,
        contact: [client.phone, client.email].filter(Boolean).join(' · '),
        bankAccount: client.bankAccount,
        verified: client.verified,
      },
      bankVerified: client.verified,
    });
  };

  const handleSaveDraft = () => {
    saveQuote(quote);
    const now = new Date();
    setLastSavedAt(now);
    setLastSavedLabel(formatSavedLabel(now));
  };

  const handleDeliveryDateChange = (deliveryDate: string) => {
    persist({
      ...quote,
      deliveryDate: deliveryDate || undefined,
      transactionTerms: {
        paymentMethod:
          quote.transactionTerms?.paymentMethod ??
          '안전결제 (선금 30% PO 합의 시 / 잔금 70% 납품 확인 시)',
        deliverySchedule: deliveryDate
          ? `${deliveryDate.replace(/-/g, '.')} (발주처 확정)`
          : '발주처 납품일 확정 후 자동 반영',
      },
    });
  };

  const handleShippingAddressChange = (shippingAddress: string) => {
    persist({ ...quote, shippingAddress: shippingAddress || undefined });
  };

  const handleClientPoSignature = useCallback(
    (signed: boolean, imageDataUrl?: string) => {
      setHasClientPoSignature(signed);
      const signerName =
        quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ?? '김민수';

      if (!signed || !imageDataUrl) {
        persist({
          ...quote,
          signatures: quote.signatures.filter(
            (s) => !(s.party === 'CLIENT' && (s.scope === 'PO' || !s.scope))
          ),
        });
        return;
      }

      persist({
        ...quote,
        signatures: upsertSignature(quote.signatures, {
          party: 'CLIENT',
          scope: 'PO',
          signedAt: new Date().toISOString(),
          signerName,
          signatureImage: imageDataUrl,
        }),
      });
    },
    [quote, persist]
  );

  const handleSupplierPoSignature = useCallback(
    (signed: boolean, imageDataUrl?: string) => {
      setHasSupplierPoSignature(signed);
      const signerName =
        quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규';

      if (!signed || !imageDataUrl) {
        persist({
          ...quote,
          signatures: quote.signatures.filter(
            (s) => !(s.party === 'SUPPLIER' && s.scope === 'PO')
          ),
        });
        return;
      }

      persist({
        ...quote,
        signatures: upsertSignature(quote.signatures, {
          party: 'SUPPLIER',
          scope: 'PO',
          signedAt: new Date().toISOString(),
          signerName,
          signatureImage: imageDataUrl,
        }),
      });
    },
    [quote, persist]
  );

  const handleDraftSignatureChange = useCallback(
    (signed: boolean, imageDataUrl?: string) => {
      setHasDraftSupplierSignature(signed);
      const signerName =
        quote.supplierProfile?.representative.replace(/\s*대표\s*$/, '') ?? '박장규';

      if (!signed || !imageDataUrl) {
        persist({
          ...quote,
          signatures: quote.signatures.filter(
            (s) => !(s.party === 'SUPPLIER' && (s.scope === 'PI' || !s.scope)),
          ),
        });
        return;
      }

      persist({
        ...quote,
        signatures: upsertSignature(quote.signatures, {
          party: 'SUPPLIER',
          scope: 'PI',
          signedAt: new Date().toISOString(),
          signerName,
          signatureImage: imageDataUrl,
        }),
      });
    },
    [quote, persist],
  );

  const handleIssueQuote = async () => {
    const signatureImage = getPiSupplierSignature(quote)?.signatureImage;
    if (!signatureImage) {
      alert('서명 이미지가 필요합니다.');
      return;
    }

    setBusy(true);
    try {
      const { tradeId } = await startTrade(quote, signatureImage);
      persist(enrichIssuedQuote({ ...quote, tradeId }));
    } catch (error: unknown) {
      alert(getStartTradeErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleAction = async (action: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/quotes/${quote.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, patch: quote }),
      });
      const result = await res.json();
      if (!result.ok) {
        alert(result.error ?? '처리에 실패했습니다.');
        return;
      }
      setQuote(result.quote);
      router.refresh();
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const draftActions = [
    {
      label: '서명하고 견적서 발행',
      variant: 'primary' as const,
      disabled: busy || !hasDraftSupplierSignature,
      onClick: () => void handleIssueQuote(),
    },
    {
      label: '임시저장',
      variant: 'secondary' as const,
      disabled: busy,
      onClick: handleSaveDraft,
    },
  ];

  const sidebar = isDraftSupplier ? (
    <SupplierQuoteDraftSidebar
      totals={quote.totals}
      downPaymentPercent={quote.downPaymentPercent}
      paymentTerms={quote.paymentTerms}
      actions={draftActions}
    />
  ) : isIssued && viewerRole === 'SUPPLIER' ? (
    <SupplierQuoteIssuedSidebar
      quote={quote}
      busy={busy}
      onResendNotification={() => alert('발주처에 알림을 다시 보냈습니다.')}
    />
  ) : isIssued && viewerRole === 'CLIENT' ? (
    <ClientQuoteIssuedSidebar
      quote={quote}
      busy={busy}
      onStartPo={() => handleAction('START_PO')}
      onReject={() => handleAction('REJECT_QUOTE')}
    />
  ) : isPoDraftClient ? (
    <ClientQuotePoDraftSidebar
      quote={quote}
      hasDeliveryDate={!!quote.deliveryDate}
      hasShippingAddress={!!quote.shippingAddress?.trim()}
      hasSignature={hasClientPoSignature}
      busy={busy}
      onIssuePo={() => handleAction('ISSUE_PO')}
      onSaveDraft={handleSaveDraft}
    />
  ) : isPoIssued && viewerRole === 'CLIENT' ? (
    <ClientQuotePoIssuedSidebar quote={quote} busy={busy} />
  ) : isPoIssued && viewerRole === 'SUPPLIER' ? (
    <SupplierQuotePoIssuedSidebar
      quote={quote}
      busy={busy}
      canSign={hasSupplierPoSignature}
      onSignPo={() => handleAction('SIGN_PO')}
      onReject={() => alert('반려/수정 요청이 발주처에 전달되었습니다.')}
    />
  ) : isPoConfirmedSupplier ? (
    <SupplierQuotePoConfirmedSidebar
      quote={quote}
      busy={busy}
      onCreateInvoice={() => router.push(`/documents/invoices/${quote.id}`)}
      onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
    />
  ) : isPoConfirmedClient ? (
    <ClientQuotePoConfirmedSidebar
      quote={quote}
      busy={busy}
      onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
      onContactSupplier={() =>
        alert(`${quote.supplier.companyName} 담당자에게 연결됩니다.`)
      }
    />
  ) : isInvoiceIssuedClient ? (
    <ClientQuoteInvoiceIssuedSidebar
      quote={quote}
      busy={busy}
      onConfirmReceipt={() => alert('수령 확인·서명 화면은 준비 중입니다.')}
      onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
      onContactSupplier={() =>
        alert(`${quote.supplier.companyName} 담당자에게 연결됩니다.`)
      }
    />
  ) : (
    <DocumentSidebar
      quote={quote}
      config={config}
      viewerRole={viewerRole}
      onAction={handleAction}
      busy={busy}
    />
  );

  return (
    <DocumentShell variant={useWideLayout ? 'draft' : 'default'} sidebar={sidebar}>
      <QuoteScreenRouter
        quote={quote}
        viewerRole={viewerRole}
        editable={config.editable}
        showSignature={config.showSignature}
        lastSavedLabel={lastSavedLabel}
        onItemsChange={config.editable ? handleItemsChange : undefined}
        onClientChange={isDraftSupplier ? handleClientChange : undefined}
        onDownPaymentPercentChange={
          isDraftSupplier ? handleDownPaymentPercentChange : undefined
        }
        onScheduleChange={isDraftSupplier ? handleScheduleChange : undefined}
        onSignatureChange={
          isDraftSupplier
            ? handleDraftSignatureChange
            : isPoDraftClient
              ? handleClientPoSignature
              : isPoIssuedSupplier
                ? handleSupplierPoSignature
                : undefined
        }
        onDeliveryDateChange={isPoDraftClient ? handleDeliveryDateChange : undefined}
        onShippingAddressChange={isPoDraftClient ? handleShippingAddressChange : undefined}
      />
    </DocumentShell>
  );
}
