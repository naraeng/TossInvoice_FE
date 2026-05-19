'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import PageContainer from '@/components/layout/PageContainer';
import TradeBoard from '@/features/trade/TradeBoard';
import TradeHeader from '@/features/trade/TradeHeader';
import { apiClient } from '@/lib/api';
import type { TradeApiRow, TradePageResponse, TradePhase, TradeRole } from '@/features/trade/types';

type TradeResponse = {
  result?: TradePageResponse | null;
};

const PAGE_SIZE = 5;

function TradePageInner() {
  const searchParams = useSearchParams();
  const initialRole: TradeRole = searchParams.get('tab') === 'purchase' ? 'BUYER' : 'SELLER';

  const [activeRole, setActiveRole] = useState<TradeRole>(initialRole);
  const [activePhase, setActivePhase] = useState<TradePhase>('ACTIVE');
  const [currentPage, setCurrentPage] = useState(1);

  import { fetchMyTrades } from '@/lib/trades/fetch-trades';
  import { fetchMe } from '@/lib/users/fetch-me';
  import type { TradeApiRow } from '@/features/trade/types';

  export default function TradePage() {
    const [trades, setTrades] = useState<TradeApiRow[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPartners, setTotalPartners] = useState(0);
    const [activePartners, setActivePartners] = useState(0);
    const [newPartnersThisMonth, setNewPartnersThisMonth] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchTrades = useCallback(async (role: TradeRole, phase: TradePhase, page: number) => {
      setLoading(true);
      try {
        const tradesRes = await apiClient.get(
          `/api/v1/trades?role=${role}&phase=${phase}&page=${page}&size=${PAGE_SIZE}`
        );
        const pageData = (tradesRes.data as TradeResponse).result;
        setTrades(pageData?.trades ?? []);
        setCurrentPage(pageData?.currentPage ?? page);
        setTotalPages(pageData?.totalPages ?? 1);
        setTotalPartners(pageData?.totalPartners ?? 0);
        setActivePartners(pageData?.activePartners ?? 0);
        setNewPartnersThisMonth(pageData?.newPartnersThisMonth ?? 0);
      } catch {
        if (cancelled) return;
        setMyBusinessNumber('');
        setTrades([]);
      } finally {
        setLoading(false);
      }
    }, []);

    // role/phase/page 변경 시 재호출
    useEffect(() => {
      fetchTrades(activeRole, activePhase, currentPage);
    }, [fetchTrades, activeRole, activePhase, currentPage]);

    const handleRoleChange = (role: TradeRole) => {
      if (role === activeRole || loading) return;
      setActiveRole(role);
      setCurrentPage(1);
    };

    const handlePhaseChange = (phase: TradePhase) => {
      if (phase === activePhase || loading) return;
      setActivePhase(phase);
      setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage || loading) return;
      setCurrentPage(page);
    };

    return (
      <div className="bg-white text-slate-900">
        <PageContainer className="flex flex-col gap-4 pb-16 pt-8">
          <TradeHeader
            totalPartners={totalPartners}
            activePartners={activePartners}
            newPartnersThisMonth={newPartnersThisMonth}
          />
          <TradeBoard
            trades={trades}
            activeRole={activeRole}
            activePhase={activePhase}
            onRoleChange={handleRoleChange}
            onPhaseChange={handlePhaseChange}
            loading={loading}
          />

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
          <TradeHeader inProgressCount={inProgressCount} completedCount={completedCount} />
          <Suspense>
            <TradeBoard trades={trades} myBusinessNumber={myBusinessNumber} />
          </Suspense>
        </PageContainer>
      </div>
    );
  }

  export default function TradePage() {
    return (
      <Suspense>
        <TradePageInner />
      </Suspense>
    );
  }
}
