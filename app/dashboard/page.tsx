'use client';

import { useEffect, useMemo, useState } from 'react';

import PageContainer from '@/components/layout/PageContainer';
import DashboardHeader from '@/features/dashboard/DashboardHeader';
import DashboardTransactions from '@/features/dashboard/DashboardTransactions';
import MonthlyGraph from '@/features/dashboard/MonthlyGraph';
import NoticeList from '@/features/dashboard/NoticeList';
import { apiClient } from '@/lib/api';
import { saveMemberProfile } from '@/lib/auth-user';
import { isRememberLoginEnabled } from '@/lib/auth-storage';
import type { TransactionRow } from '@/features/dashboard/TransactionTableCard';
import type { TradeApiRow, TradePageResponse } from '@/features/trade/types';

type TradeResponse = { result?: TradePageResponse | null };
type MyInfoResponse = {
  result?: {
    businessNumber?: string;
    companyName?: string;
    ceoName?: string;
  } | null;
};

export type MonthlyTrendItem = {
  month: string;        // "YYYY-MM"
  sellingAmount: number;
  buyingAmount: number;
};

type DashboardHomeResponse = {
  result?: {
    todayActiveCount?: number;
    sellingInProgress?: { total?: number; awaitingCounterSign?: number };
    buyingInProgress?: { total?: number; poInProgress?: number; deliveryWaiting?: number; inspectionWaiting?: number };
    paymentWaiting?: { amount?: number; depositCount?: number; balanceCount?: number };
    thisMonthBuyAmount?: { amount?: number; deltaPercent?: number; direction?: string };
    monthlyTrend?: MonthlyTrendItem[];
  } | null;
};

function statusToProgressStep(status: string): number {
  switch (status) {
    case 'PENDING_PO': return 0;
    case 'PENDING_SELLER_SIGN': return 1;
    case 'PENDING_INVOICE': return 2;
    case 'PENDING_BUYER_CONFIRM': return 3;
    case 'COMPLETED': return 4;
    default: return 0;
  }
}

export default function DashboardPage() {
  const [trades, setTrades] = useState<TradeApiRow[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');

  // Dashboard Home KPI
  const [inProgressCount, setInProgressCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState(0);
  const [monthlyNetAmount, setMonthlyNetAmount] = useState(0);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [sellerRes, buyerRes, meRes, homeRes] = await Promise.all([
          apiClient.get('/api/v1/trades?role=SELLER&phase=ACTIVE&page=1&size=5'),
          apiClient.get('/api/v1/trades?role=BUYER&phase=ACTIVE&page=1&size=5'),
          apiClient.get('/api/v1/users/me'),
          apiClient.get('/api/v1/dashboard/home'),
        ]);
        if (cancelled) return;

        // 거래 목록 (미리보기 테이블용) — SELLER ACTIVE + BUYER ACTIVE 합쳐서 사용
        const sellerTrades = (sellerRes.data as TradeResponse).result?.trades ?? [];
        const buyerTrades = (buyerRes.data as TradeResponse).result?.trades ?? [];
        const fetched = [...sellerTrades, ...buyerTrades];

        // 내 정보
        const meResult = (meRes.data as MyInfoResponse)?.result;
        const company = meResult?.companyName ?? '';
        const ceo = meResult?.ceoName ?? '';

        // Dashboard Home KPI
        const home = (homeRes.data as DashboardHomeResponse)?.result;
        const selling = home?.sellingInProgress;
        const buying = home?.buyingInProgress;

        setTrades(fetched);
        setCompanyName(company);
        setCeoName(ceo);
        setInProgressCount(home?.todayActiveCount ?? 0);
        setPendingCount(
          (selling?.awaitingCounterSign ?? 0) + (buying?.inspectionWaiting ?? 0),
        );
        setPendingPaymentAmount(home?.paymentWaiting?.amount ?? 0);
        setMonthlyNetAmount(home?.thisMonthBuyAmount?.amount ?? 0);
        setMonthlyTrend(home?.monthlyTrend ?? []);

        if (company || ceo) {
          saveMemberProfile({ companyName: company, ceoName: ceo }, isRememberLoginEnabled());
        }
      } catch {
        if (cancelled) return;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── 거래 테이블 rows (미리보기 5건) ────────────────────────────────────────
  const salesRows = useMemo<TransactionRow[]>(
    () =>
      trades
        .filter((t) => t.role === 'SELLER' && t.status !== 'COMPLETED')
        .map((t) => ({
          id: t.invoiceDocNumber ?? `INV-${t.tradeId}`,
          partner: t.buyer.companyName,
          item: t.itemsSummary ?? '-',
          progressStep: statusToProgressStep(t.status),
          cancelled: t.status === 'CANCELLED',
        })),
    [trades],
  );

  const purchaseRows = useMemo<TransactionRow[]>(
    () =>
      trades
        .filter((t) => t.role === 'BUYER' && t.status !== 'COMPLETED')
        .map((t) => ({
          id: t.invoiceDocNumber ?? `INV-${t.tradeId}`,
          partner: t.seller.companyName,
          item: t.itemsSummary ?? '-',
          progressStep: statusToProgressStep(t.status),
          cancelled: t.status === 'CANCELLED',
        })),
    [trades],
  );

  return (
    <div className="bg-white text-slate-900">
      <PageContainer className="flex flex-col gap-6 pb-16 pt-8">
        <DashboardHeader
          companyName={companyName}
          ceoName={ceoName}
          inProgressCount={inProgressCount}
          pendingCount={pendingCount}
          pendingPaymentAmount={pendingPaymentAmount}
          monthlyNetAmount={monthlyNetAmount}
        />
        <div className="grid gap-4 lg:grid-cols-[2fr_0.9fr]">
          <MonthlyGraph monthlyTrend={monthlyTrend} />
          <NoticeList />
        </div>
        <DashboardTransactions salesRows={salesRows} purchaseRows={purchaseRows} />
      </PageContainer>
    </div>
  );
}
