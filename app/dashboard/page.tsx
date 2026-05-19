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
import type { TradeApiRow } from '@/features/trade/types';

type TradeResponse = { result?: TradeApiRow[] };
type MyInfoResponse = {
  result?: {
    businessNumber?: string;
    companyName?: string;
    ceoName?: string;
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

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function DashboardPage() {
  const [trades, setTrades] = useState<TradeApiRow[]>([]);
  const [myBn, setMyBn] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ceoName, setCeoName] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [tradesRes, meRes] = await Promise.all([
          apiClient.get('/api/v1/trades'),
          apiClient.get('/api/v1/users/me'),
        ]);
        if (cancelled) return;
        const fetched = ((tradesRes.data as TradeResponse).result ?? []);
        const meResult = (meRes.data as MyInfoResponse)?.result;
        const bn = (meResult?.businessNumber ?? '').replace(/\D/g, '');
        const mine =
          bn.length === 10
            ? fetched.filter((t) => {
                const s = (t.seller.businessNumber ?? '').replace(/\D/g, '');
                const b = (t.buyer.businessNumber ?? '').replace(/\D/g, '');
                return s === bn || b === bn;
              })
            : [];

        const company = meResult?.companyName ?? '';
        const ceo = meResult?.ceoName ?? '';
        setMyBn(bn);
        setTrades(mine);
        setCompanyName(company);
        setCeoName(ceo);

        // localStorage에 저장해 MemberHeader 등 다른 곳에서도 사용 가능하게
        if (company || ceo) {
          saveMemberProfile({ companyName: company, ceoName: ceo }, isRememberLoginEnabled());
        }
      } catch {
        if (cancelled) return;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── 헤더 통계 ──────────────────────────────────────────────────────────────
  const inProgressCount = useMemo(
    () => trades.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length,
    [trades],
  );

  /** 내가 지금 액션을 취해야 하는 거래 수 */
  const pendingCount = useMemo(
    () =>
      trades.filter((t) => {
        const isSeller = (t.seller.businessNumber ?? '').replace(/\D/g, '') === myBn;
        return (
          (isSeller && t.status === 'PENDING_SELLER_SIGN') ||
          (!isSeller && t.status === 'PENDING_BUYER_CONFIRM')
        );
      }).length,
    [trades, myBn],
  );

  /** SELLER 입장에서 PENDING_BUYER_CONFIRM 인 거래 totalAmount 합계 (입금 예정) */
  const pendingPaymentAmount = useMemo(
    () =>
      trades
        .filter(
          (t) =>
            (t.seller.businessNumber ?? '').replace(/\D/g, '') === myBn &&
            t.status === 'PENDING_BUYER_CONFIRM',
        )
        .reduce((sum, t) => sum + (t.totalAmount ?? 0), 0),
    [trades, myBn],
  );

  /** 이번 달 완료된 거래 totalAmount 합계 */
  const monthlyAmount = useMemo(
    () =>
      trades
        .filter((t) => t.status === 'COMPLETED' && isThisMonth(t.completedAt ?? t.createdAt))
        .reduce((sum, t) => sum + (t.totalAmount ?? 0), 0),
    [trades],
  );

  // ── 거래 테이블 rows ────────────────────────────────────────────────────────
  const salesRows = useMemo<TransactionRow[]>(
    () =>
      trades
        .filter(
          (t) =>
            (t.seller.businessNumber ?? '').replace(/\D/g, '') === myBn &&
            t.status !== 'COMPLETED',
        )
        .map((t) => ({
          id: t.invoiceDocNumber ?? `INV-${t.tradeId}`,
          partner: t.buyer.companyName,
          item: t.itemsSummary ?? '-',
          progressStep: statusToProgressStep(t.status),
          cancelled: t.status === 'CANCELLED',
        })),
    [trades, myBn],
  );

  const purchaseRows = useMemo<TransactionRow[]>(
    () =>
      trades
        .filter(
          (t) =>
            (t.buyer.businessNumber ?? '').replace(/\D/g, '') === myBn &&
            t.status !== 'COMPLETED',
        )
        .map((t) => ({
          id: t.invoiceDocNumber ?? `INV-${t.tradeId}`,
          partner: t.seller.companyName,
          item: t.itemsSummary ?? '-',
          progressStep: statusToProgressStep(t.status),
          cancelled: t.status === 'CANCELLED',
        })),
    [trades, myBn],
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
          monthlyAmount={monthlyAmount}
        />
        <div className="grid gap-4 lg:grid-cols-[2fr_0.9fr]">
          <MonthlyGraph trades={trades} />
          <NoticeList />
        </div>
        <DashboardTransactions salesRows={salesRows} purchaseRows={purchaseRows} />
      </PageContainer>
    </div>
  );
}
