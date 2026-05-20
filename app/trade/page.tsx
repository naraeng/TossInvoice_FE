'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import PageContainer from '@/components/layout/PageContainer';
import TradeBoard from '@/features/trade/TradeBoard';
import TradeHeader from '@/features/trade/TradeHeader';
import { apiClient } from '@/lib/api';
import { useAuthGuard } from '@/lib/auth-guard';
import type { TradeApiRow, TradePageResponse, TradePhase, TradeRole } from '@/features/trade/types';

const PAGE_SIZE = 5;

type TradesApiResponse = {
  errorCode: string | null;
  message: string;
  result: TradePageResponse | null;
};

function TradePageContent() {
  const { ready } = useAuthGuard();
  const searchParams = useSearchParams();
  const initialRole: TradeRole = searchParams.get('tab') === 'purchase' ? 'BUYER' : 'SELLER';

  const [activeRole, setActiveRole] = useState<TradeRole>(initialRole);
  const [activePhase, setActivePhase] = useState<TradePhase>('ACTIVE');
  const [currentPage, setCurrentPage] = useState(1);
  const [trades, setTrades] = useState<TradeApiRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPartners, setTotalPartners] = useState(0);
  const [activePartners, setActivePartners] = useState(0);
  const [newPartnersThisMonth, setNewPartnersThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchTrades = useCallback(async (role: TradeRole, phase: TradePhase, page: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiClient.get<TradesApiResponse>('/api/v1/trades', {
        params: { role, phase, page, size: PAGE_SIZE },
      });

      const pageData = res.data.result;
      if (!pageData && res.data.errorCode && res.data.errorCode !== 'SUCCESS') {
        throw new Error(res.data.message || '거래 목록을 불러오지 못했습니다.');
      }

      setTrades(pageData?.trades ?? []);
      setCurrentPage(pageData?.currentPage ?? page);
      setTotalPages(Math.max(1, pageData?.totalPages ?? 1));
      setTotalPartners(pageData?.totalPartners ?? 0);
      setActivePartners(pageData?.activePartners ?? 0);
      setNewPartnersThisMonth(pageData?.newPartnersThisMonth ?? 0);
    } catch (error: unknown) {
      setTrades([]);
      const message =
        typeof error === 'object' &&
        error &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message ===
          'string'
          ? (error as { response: { data: { message: string } } }).response.data.message
          : error instanceof Error
            ? error.message
            : '거래 목록을 불러오지 못했습니다.';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const fetchData = async () => {
      await fetchTrades(activeRole, activePhase, currentPage);
    };
    void fetchData();
  }, [ready, fetchTrades, activeRole, activePhase, currentPage]);

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

  if (!ready) {
    return (
      <div className="bg-white text-slate-900">
        <PageContainer className="py-8">
          <p className="text-sm text-slate-500">거래 목록을 불러오는 중…</p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900">
      <PageContainer className="flex flex-col gap-4 pb-16 pt-8">
        <TradeHeader
          totalPartners={totalPartners}
          activePartners={activePartners}
          newPartnersThisMonth={newPartnersThisMonth}
        />

        {loadError && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {loadError}
          </p>
        )}

        <TradeBoard
          trades={trades}
          activeRole={activeRole}
          activePhase={activePhase}
          onRoleChange={handleRoleChange}
          onPhaseChange={handlePhaseChange}
          loading={loading}
        />

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

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="py-8">
          <p className="text-sm text-slate-500">거래 목록을 불러오는 중…</p>
        </PageContainer>
      }
    >
      <TradePageContent />
    </Suspense>
  );
}
