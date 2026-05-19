'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';

import PageContainer from '@/components/layout/PageContainer';
import TradeBoard from '@/features/trade/TradeBoard';
import TradeHeader from '@/features/trade/TradeHeader';
import { apiClient } from '@/lib/api';
import type { TradeApiRow } from '@/features/trade/types';

type TradeResponse = {
  result?: TradeApiRow[];
};

type MyInfoResponse = {
  result?: {
    businessNumber?: string;
  } | null;
};

export default function TradePage() {
  const [trades, setTrades] = useState<TradeApiRow[]>([]);
  const [myBusinessNumber, setMyBusinessNumber] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [tradesRes, meRes] = await Promise.all([
          apiClient.get('/api/v1/trades'),
          apiClient.get('/api/v1/users/me'),
        ]);
        if (cancelled) return;
        const fetchedTrades = ((tradesRes.data as TradeResponse).result ?? []).slice();
        const businessNumber = (meRes.data as MyInfoResponse)?.result?.businessNumber ?? '';
        const normalizedBusinessNumber = businessNumber.replace(/\D/g, '');

        // Safety filter on client side: show only trades where I participate.
        // Fail-closed: if my business number is missing/invalid, show nothing.
        const mine =
          normalizedBusinessNumber.length === 10
            ? fetchedTrades.filter((trade) => {
                const sellerBn = (trade.seller.businessNumber ?? '').replace(/\D/g, '');
                const buyerBn = (trade.buyer.businessNumber ?? '').replace(/\D/g, '');
                return sellerBn === normalizedBusinessNumber || buyerBn === normalizedBusinessNumber;
              })
            : [];

        setMyBusinessNumber(normalizedBusinessNumber);
        setTrades(mine);
      } catch {
        if (cancelled) return;
        setMyBusinessNumber('');
        setTrades([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const inProgressCount = useMemo(
    () => trades.filter((trade) => trade.status !== 'COMPLETED').length,
    [trades],
  );
  const completedCount = useMemo(
    () => trades.filter((trade) => trade.status === 'COMPLETED').length,
    [trades],
  );
  const counterparties = useMemo(
    () =>
      new Set(
        trades.map((trade) => (trade.role === 'SELLER' ? trade.buyer.userId : trade.seller.userId)),
      ).size,
    [myBusinessNumber, trades],
  );

  return (
    <div className="bg-white text-slate-900">
      <PageContainer className="flex flex-col gap-4 pb-16 pt-8">
        <TradeHeader
          totalCounterparties={counterparties}
          inProgressCount={inProgressCount}
          completedCount={completedCount}
        />
        <Suspense>
          <TradeBoard trades={trades} myBusinessNumber={myBusinessNumber} />
        </Suspense>
      </PageContainer>
    </div>
  );
}
