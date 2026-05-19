'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import PageContainer from '@/components/layout/PageContainer';
import TradeBoard from '@/features/trade/TradeBoard';
import TradeHeader from '@/features/trade/TradeHeader';
import { apiClient } from '@/lib/api';
import type { TradeApiRow, TradePageResponse } from '@/features/trade/types';

type TradeResponse = {
  result?: TradePageResponse | null;
};

const PAGE_SIZE = 5;

export default function TradePage() {
  const [trades, setTrades] = useState<TradeApiRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTrades = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const tradesRes = await apiClient.get(
          `/api/v1/trades?page=${page}&size=${PAGE_SIZE}`,
        );
        const pageData = (tradesRes.data as TradeResponse).result;
        setTrades(pageData?.trades ?? []);
        setCurrentPage(pageData?.currentPage ?? page);
        setTotalPages(pageData?.totalPages ?? 1);
        setTotalElements(pageData?.totalElements ?? 0);
      } catch {
        setTrades([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTrades(1);
  }, [fetchTrades]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || loading) return;
    setCurrentPage(page);
    fetchTrades(page);
  };

  // 현재 페이지 기준 통계 (서버가 분리된 집계 API를 제공하지 않으므로 현재 페이지 데이터로 계산)
  const inProgressCount = useMemo(
    () => trades.filter((trade) => trade.status !== 'COMPLETED' && trade.status !== 'CANCELLED').length,
    [trades],
  );
  const completedCount = useMemo(
    () => trades.filter((trade) => trade.status === 'COMPLETED').length,
    [trades],
  );
  // trade.role이 API가 내려준 내 역할이므로 사업자번호 비교 불필요
  const counterparties = useMemo(
    () =>
      new Set(
        trades.map((trade) =>
          trade.role === 'SELLER' ? trade.buyer.userId : trade.seller.userId,
        ),
      ).size,
    [trades],
  );

  return (
    <div className="bg-white text-slate-900">
      <PageContainer className="flex flex-col gap-4 pb-16 pt-8">
        <TradeHeader
          totalCounterparties={counterparties}
          inProgressCount={inProgressCount}
          completedCount={completedCount}
          totalElements={totalElements}
        />
        <Suspense>
          <TradeBoard trades={trades} loading={loading} />
        </Suspense>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 pt-2">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                disabled={loading}
                onClick={() => handlePageChange(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition ${
                  page === currentPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                } disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
