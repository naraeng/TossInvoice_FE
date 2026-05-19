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
import { InvoiceCompletedSidebar } from '@/features/documents/invoice/shared/InvoiceCompletedSidebar';
import { SupplierInvoiceIssuedSidebar } from '@/features/documents/invoice/supplier/SupplierInvoiceIssuedSidebar';
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
import { clampDownPaymentPercent, formatPaymentTerms } from '@/lib/documents/payment-terms';
import {
  minValidityUntilDate,
  normalizePaymentDueDays,
  normalizeProductionDays,
  type QuoteSchedule,
} from '@/lib/documents/schedule';
import { syncQuoteViaApi } from '@/lib/documents/sync-quote-client';
import { fetchTradeDetail } from '@/lib/trades/fetch-trade-detail';
import { mapTradeDetailToQuote } from '@/lib/trades/map-trade-to-quote';
import { getIssuePurchaseOrderErrorMessage } from '@/lib/trades/issue-purchase-order-errors';
import { issuePurchaseOrder } from '@/lib/trades/issue-purchase-order';
import { getRejectPurchaseOrderErrorMessage } from '@/lib/trades/reject-purchase-order-errors';
import { rejectPurchaseOrder } from '@/lib/trades/reject-purchase-order';
import { getRejectTradeErrorMessage } from '@/lib/trades/reject-trade-errors';
import { rejectTrade } from '@/lib/trades/reject-trade';
import { getSignInvoiceErrorMessage } from '@/lib/trades/sign-invoice-errors';
import { signInvoice } from '@/lib/trades/sign-invoice';
import { getSignPurchaseOrderErrorMessage } from '@/lib/trades/sign-purchase-order-errors';
import { signPurchaseOrder } from '@/lib/trades/sign-purchase-order';
import { getStartPurchaseOrderErrorMessage } from '@/lib/trades/start-purchase-order-errors';
import { startPurchaseOrder } from '@/lib/trades/start-purchase-order';
import { getStartTradeErrorMessage } from '@/lib/trades/start-trade-errors';
import { startTrade } from '@/lib/trades/start-trade';
import {
  getInvoiceClientSignature,
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
  const [hasClientInvoiceSignature, setHasClientInvoiceSignature] = useState(
    () => !!getInvoiceClientSignature(quote)?.signatureImage,
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
  const isInvoiceIssuedSupplier = quote.status === 'INVOICE_ISSUED' && viewerRole === 'SUPPLIER';
  const isInvoiceCompleted = quote.status === 'INVOICE_COMPLETED';
  const useWideLayout =
    isDraftSupplier ||
    isIssued ||
    isPoDraftClient ||
    isPoIssued ||
    isPoConfirmedSupplier ||
    isPoConfirmedClient ||
    isInvoiceIssuedClient ||
    isInvoiceIssuedSupplier ||
    isInvoiceCompleted;

  useEffect(() => {
    const tick = setInterval(() => {
      setLastSavedLabel(formatSavedLabel(lastSavedAt));
    }, 5000);
    return () => clearInterval(tick);
  }, [lastSavedAt]);

  useEffect(() => {
    const tradeId = initialQuote.tradeId;
    if (
      tradeId == null ||
      (initialQuote.status !== 'INVOICE_ISSUED' && initialQuote.status !== 'INVOICE_COMPLETED')
    ) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const detail = await fetchTradeDetail(tradeId);
        const perspectiveRole = viewerRole === 'SUPPLIER' ? 'SELLER' : 'BUYER';
        const nextQuote = {
          ...mapTradeDetailToQuote(detail, { perspectiveRole }),
          viewerRoleHint: initialQuote.viewerRoleHint ?? viewerRole,
        };

        if (!cancelled) {
          setQuote(nextQuote);
          saveQuote(nextQuote);
          setHasClientInvoiceSignature(!!getInvoiceClientSignature(nextQuote)?.signatureImage);
        }
      } catch {
        // 스토어 데이터 유지
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialQuote.id, initialQuote.status, initialQuote.tradeId, initialQuote.viewerRoleHint, viewerRole]);

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

  const handleClientInvoiceSignature = useCallback(
    (signed: boolean, imageDataUrl?: string) => {
      setHasClientInvoiceSignature(signed);
      const signerName =
        quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ?? '김민수';

      if (!signed || !imageDataUrl) {
        persist({
          ...quote,
          signatures: quote.signatures.filter(
            (s) => !(s.party === 'CLIENT' && s.scope === 'INVOICE'),
          ),
        });
        return;
      }

      persist({
        ...quote,
        signatures: upsertSignature(quote.signatures, {
          party: 'CLIENT',
          scope: 'INVOICE',
          signedAt: new Date().toISOString(),
          signerName,
          signatureImage: imageDataUrl,
        }),
      });
    },
    [quote, persist],
  );

  const handleConfirmFinalInvoice = async () => {
    const tradeId = quote.tradeId;
    if (tradeId == null) {
      alert('연결된 거래 정보가 없습니다.');
      return;
    }

    const signatureImage = getInvoiceClientSignature(quote)?.signatureImage;
    if (!signatureImage) {
      alert('최종 서명을 완료해 주세요.');
      return;
    }

    setBusy(true);
    try {
      await signInvoice(tradeId, signatureImage);
      const detail = await fetchTradeDetail(tradeId);
      const nextQuote = {
        ...mapTradeDetailToQuote(detail, { perspectiveRole: 'BUYER' }),
        viewerRoleHint: quote.viewerRoleHint ?? viewerRole,
      };
      await syncQuoteViaApi(nextQuote);
      setQuote(nextQuote);
      saveQuote(nextQuote);
      setHasClientInvoiceSignature(!!getInvoiceClientSignature(nextQuote)?.signatureImage);
      router.refresh();
      alert('최종 서명이 완료되었습니다. 잔금 송금이 처리되었고, 보관용 invoice가 생성되었습니다.');
    } catch (error: unknown) {
      alert(getSignInvoiceErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleClientPoSignature = useCallback(
    (signed: boolean, imageDataUrl?: string) => {
      setHasClientPoSignature(signed);
      const signerName = quote.clientProfile?.representative.replace(/\s*대표\s*$/, '') ?? '김민수';

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
          signatures: quote.signatures.filter((s) => !(s.party === 'SUPPLIER' && s.scope === 'PO')),
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
            (s) => !(s.party === 'SUPPLIER' && (s.scope === 'PI' || !s.scope))
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
    [quote, persist]
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

  const handleIssuePo = async () => {
    const tradeId = quote.tradeId;
    if (tradeId == null) {
      alert('연결된 거래 정보가 없습니다.');
      return;
    }

    const signatureImage = getPoClientSignature(quote)?.signatureImage;
    if (!signatureImage) {
      alert('서명 이미지가 필요합니다.');
      return;
    }

    if (!quote.deliveryDate?.trim()) {
      alert('납품 확정일을 입력해 주세요.');
      return;
    }

    if (!quote.shippingAddress?.trim()) {
      alert('배송 주소를 입력해 주세요.');
      return;
    }

    setBusy(true);
    try {
      await issuePurchaseOrder(tradeId, quote, signatureImage);
      const detail = await fetchTradeDetail(tradeId);
      const nextQuote = {
        ...mapTradeDetailToQuote(detail),
        viewerRoleHint: quote.viewerRoleHint ?? viewerRole,
      };
      await syncQuoteViaApi(nextQuote);
      setQuote(nextQuote);
      router.refresh();
    } catch (error: unknown) {
      alert(getIssuePurchaseOrderErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleSignPo = async () => {
    const tradeId = quote.tradeId;
    if (tradeId == null) {
      alert('연결된 거래 정보가 없습니다.');
      return;
    }

    const signatureImage = getPoSupplierSignature(quote)?.signatureImage;
    if (!signatureImage) {
      alert('서명 이미지가 필요합니다.');
      return;
    }

    if (!quote.deliveryDate?.trim()) {
      alert('납품 확정일을 확인해 주세요.');
      return;
    }

    setBusy(true);
    try {
      await signPurchaseOrder(tradeId, quote, signatureImage);
      const detail = await fetchTradeDetail(tradeId);
      const nextQuote = {
        ...mapTradeDetailToQuote(detail),
        viewerRoleHint: quote.viewerRoleHint ?? viewerRole,
      };
      await syncQuoteViaApi(nextQuote);
      setQuote(nextQuote);
      router.refresh();
    } catch (error: unknown) {
      alert(getSignPurchaseOrderErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleRejectPo = async () => {
    const tradeId = quote.tradeId;
    if (tradeId == null) {
      alert('연결된 거래 정보가 없습니다.');
      return;
    }

    const confirmed = window.confirm(
      '발주서(PO)를 반려하고 거래를 취소할까요?\n발주처에 수정 요청이 전달됩니다.',
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await rejectPurchaseOrder(tradeId);
      router.push('/trade');
    } catch (error: unknown) {
      alert(getRejectPurchaseOrderErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleRejectPi = async () => {
    const tradeId = quote.tradeId;
    if (tradeId == null) {
      alert('연결된 거래 정보가 없습니다.');
      return;
    }

    const confirmed = window.confirm(
      '견적서(PI)를 거절하고 거래를 취소할까요?\n발주서 작성이 시작된 거래는 취소할 수 없습니다.',
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await rejectTrade(tradeId);
      router.push('/trade?tab=purchase');
    } catch (error: unknown) {
      alert(getRejectTradeErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleStartPo = async () => {
    const tradeId = quote.tradeId;
    if (tradeId == null) {
      alert('연결된 거래 정보가 없습니다.');
      return;
    }

    setBusy(true);
    try {
      await startPurchaseOrder(tradeId);
      const detail = await fetchTradeDetail(tradeId);
      const nextQuote = {
        ...mapTradeDetailToQuote(detail),
        viewerRoleHint: quote.viewerRoleHint ?? viewerRole,
      };
      await syncQuoteViaApi(nextQuote);
      setQuote(nextQuote);
      router.refresh();
    } catch (error: unknown) {
      alert(getStartPurchaseOrderErrorMessage(error));
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
      onStartPo={() => void handleStartPo()}
      onReject={() => void handleRejectPi()}
    />
  ) : isPoDraftClient ? (
    <ClientQuotePoDraftSidebar
      quote={quote}
      hasDeliveryDate={!!quote.deliveryDate}
      hasShippingAddress={!!quote.shippingAddress?.trim()}
      hasSignature={hasClientPoSignature}
      busy={busy}
      onIssuePo={() => void handleIssuePo()}
      onSaveDraft={handleSaveDraft}
    />
  ) : isPoIssued && viewerRole === 'CLIENT' ? (
    <ClientQuotePoIssuedSidebar quote={quote} busy={busy} />
  ) : isPoIssued && viewerRole === 'SUPPLIER' ? (
    <SupplierQuotePoIssuedSidebar
      quote={quote}
      busy={busy}
      canSign={hasSupplierPoSignature}
      onSignPo={() => void handleSignPo()}
      onReject={() => void handleRejectPo()}
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
      onContactSupplier={() => alert(`${quote.supplier.companyName} 담당자에게 연결됩니다.`)}
    />
  ) : isInvoiceCompleted ? (
    <InvoiceCompletedSidebar
      quote={quote}
      busy={busy}
      contactLabel={
        viewerRole === 'CLIENT' ? '수주처에 문의' : '발주처에 문의'
      }
      onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
      onContact={() =>
        alert(
          viewerRole === 'CLIENT'
            ? `${quote.supplier.companyName} 담당자에게 연결됩니다.`
            : '발주처 문의 채널로 연결됩니다.',
        )
      }
      onBackToTrade={() => router.push('/trade')}
    />
  ) : isInvoiceIssuedClient ? (
    <ClientQuoteInvoiceIssuedSidebar
      quote={quote}
      busy={busy}
      canConfirm={hasClientInvoiceSignature}
      onConfirmReceipt={() => void handleConfirmFinalInvoice()}
      onReportIssue={() => alert('문제 신고 접수는 준비 중입니다.')}
      onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
      onContactSupplier={() => alert(`${quote.supplier.companyName} 담당자에게 연결됩니다.`)}
    />
  ) : isInvoiceIssuedSupplier ? (
    <SupplierInvoiceIssuedSidebar
      quote={quote}
      busy={busy}
      onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
      onContactClient={() => alert('발주처 문의 채널로 연결됩니다.')}
      onBackToTrade={() => router.push('/trade')}
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
        onDownPaymentPercentChange={isDraftSupplier ? handleDownPaymentPercentChange : undefined}
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
        hasClientInvoiceSignature={isInvoiceIssuedClient ? hasClientInvoiceSignature : undefined}
        onInvoiceSignatureChange={
          isInvoiceIssuedClient ? handleClientInvoiceSignature : undefined
        }
        onDeliveryDateChange={isPoDraftClient ? handleDeliveryDateChange : undefined}
        onShippingAddressChange={isPoDraftClient ? handleShippingAddressChange : undefined}
      />
    </DocumentShell>
  );
}
