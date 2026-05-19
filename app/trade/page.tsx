'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';

import PageContainer from '@/components/layout/PageContainer';
import TradeBoard from '@/features/trade/TradeBoard';
import TradeHeader from '@/features/trade/TradeHeader';
import { fetchMyTrades } from '@/lib/trades/fetch-trades';
import { fetchMe } from '@/lib/users/fetch-me';
import type { TradeApiRow } from '@/features/trade/types';

export default function TradePage() {
  const [trades, setTrades] = useState<TradeApiRow[]>([]);
  const [myBusinessNumber, setMyBusinessNumber] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [fetchedTrades, me] = await Promise.all([fetchMyTrades(), fetchMe()]);
        if (cancelled) return;

        const normalizedBusinessNumber = (me?.businessNumber ?? '').replace(/\D/g, '');
        setMyBusinessNumber(normalizedBusinessNumber);
        // API가 이미 "내 거래"만 반환
        setTrades(fetchedTrades);
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
    [trades]
  );
  const completedCount = useMemo(
    () => trades.filter((trade) => trade.status === 'COMPLETED').length,
    [trades]
  );
  const counterparties = useMemo(
    () =>
      new Set(
        trades.map((trade) => (trade.role === 'SELLER' ? trade.buyer.userId : trade.seller.userId))
      ).size,
    [myBusinessNumber, trades]
  );

  return (
    <div className="bg-white text-slate-900">
      <PageContainer className="flex flex-col gap-4 pb-16 pt-8">
        <TradeHeader inProgressCount={inProgressCount} completedCount={completedCount} />
        <Suspense>
          <TradeBoard trades={trades} myBusinessNumber={myBusinessNumber} />
        </Suspense>
      </PageContainer>
    </div>
  );
}
