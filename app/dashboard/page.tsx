'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClient } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import DashboardHeader from '@/features/dashboard/DashboardHeader';
import DashboardTransactions from '@/features/dashboard/DashboardTransactions';
import MonthlyGraph from '@/features/dashboard/MonthlyGraph';
import NoticeList from '@/features/dashboard/NoticeList';
import { saveMemberProfile } from '@/lib/auth-user';
import { isRememberLoginEnabled } from '@/lib/auth-storage';
import { useAuthGuard } from '@/lib/auth-guard';
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
  month: string; // "YYYY-MM"
  sellingAmount: number;
  buyingAmount: number;
};

type DashboardHomeResponse = {
  result?: {
    todayActiveCount?: number;
    sellingInProgress?: { total?: number; awaitingCounterSign?: number };
    buyingInProgress?: {
      total?: number;
      poInProgress?: number;
      deliveryWaiting?: number;
      inspectionWaiting?: number;
    };
    paymentWaiting?: { amount?: number; depositCount?: number; balanceCount?: number };
    thisMonthBuyAmount?: { amount?: number; deltaPercent?: number; direction?: string };
    monthlyTrend?: MonthlyTrendItem[];
  } | null;
};

function statusToProgressStep(status: string): number {
  switch (status) {
    case 'PENDING_PO':
      return 0;
    case 'PENDING_SELLER_SIGN':
      return 1;
    case 'PENDING_INVOICE':
      return 2;
    case 'PENDING_BUYER_CONFIRM':
      return 3;
    case 'COMPLETED':
      return 4;
    default:
      return 0;
  }
}

export default function DashboardPage() {
  const { ready } = useAuthGuard();
  const [trades, setTrades] = useState<TradeApiRow[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');

  // Dashboard Home KPI — 백엔드 spec 그대로 4종 분리 표시
  const [todayActiveCount, setTodayActiveCount] = useState(0);
  const [sellingTotal, setSellingTotal] = useState(0);
  const [sellingAwaitingCounterSign, setSellingAwaitingCounterSign] = useState(0);
  const [buyingTotal, setBuyingTotal] = useState(0);
  const [buyingPoInProgress, setBuyingPoInProgress] = useState(0);
  const [buyingDeliveryWaiting, setBuyingDeliveryWaiting] = useState(0);
  const [buyingInspectionWaiting, setBuyingInspectionWaiting] = useState(0);
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState(0);
  const [depositCount, setDepositCount] = useState(0);
  const [balanceCount, setBalanceCount] = useState(0);
  const [thisMonthBuyAmount, setThisMonthBuyAmount] = useState(0);
  const [thisMonthBuyDelta, setThisMonthBuyDelta] = useState(0);
  const [thisMonthBuyDirection, setThisMonthBuyDirection] = useState<string>('FLAT');
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);

  useEffect(() => {
    if (!ready) return;
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

        // Dashboard Home KPI — 백엔드 spec 그대로 분리해서 state에 보존
        const home = (homeRes.data as DashboardHomeResponse)?.result;
        const selling = home?.sellingInProgress;
        const buying = home?.buyingInProgress;
        const payment = home?.paymentWaiting;
        const monthlyBuy = home?.thisMonthBuyAmount;

        setTrades(fetched);
        setCompanyName(company);
        setCeoName(ceo);
        setTodayActiveCount(home?.todayActiveCount ?? 0);
        setSellingTotal(selling?.total ?? 0);
        setSellingAwaitingCounterSign(selling?.awaitingCounterSign ?? 0);
        setBuyingTotal(buying?.total ?? 0);
        setBuyingPoInProgress(buying?.poInProgress ?? 0);
        setBuyingDeliveryWaiting(buying?.deliveryWaiting ?? 0);
        setBuyingInspectionWaiting(buying?.inspectionWaiting ?? 0);
        setPendingPaymentAmount(payment?.amount ?? 0);
        setDepositCount(payment?.depositCount ?? 0);
        setBalanceCount(payment?.balanceCount ?? 0);
        setThisMonthBuyAmount(monthlyBuy?.amount ?? 0);
        setThisMonthBuyDelta(monthlyBuy?.deltaPercent ?? 0);
        setThisMonthBuyDirection(monthlyBuy?.direction ?? 'FLAT');
        setMonthlyTrend(home?.monthlyTrend ?? []);

        if (company || ceo) {
          saveMemberProfile({ companyName: company, ceoName: ceo }, isRememberLoginEnabled());
        }
      } catch {
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

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
    [trades]
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
    [trades]
  );

  if (!ready) {
    return (
      <div className="bg-white text-slate-900">
        <PageContainer className="py-8">
          <p className="text-sm text-slate-500">대시보드를 불러오는 중…</p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900">
      <PageContainer className="flex flex-col gap-6 pb-16 pt-8">
        <DashboardHeader
          companyName={companyName}
          ceoName={ceoName}
          todayActiveCount={todayActiveCount}
          sellingTotal={sellingTotal}
          sellingAwaitingCounterSign={sellingAwaitingCounterSign}
          buyingTotal={buyingTotal}
          buyingPoInProgress={buyingPoInProgress}
          buyingDeliveryWaiting={buyingDeliveryWaiting}
          buyingInspectionWaiting={buyingInspectionWaiting}
          pendingPaymentAmount={pendingPaymentAmount}
          depositCount={depositCount}
          balanceCount={balanceCount}
          thisMonthBuyAmount={thisMonthBuyAmount}
          thisMonthBuyDelta={thisMonthBuyDelta}
          thisMonthBuyDirection={thisMonthBuyDirection}
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
