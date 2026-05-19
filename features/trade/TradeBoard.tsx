'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowDownUp, Check, ClipboardList, Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createDraftQuoteViaApi } from '@/lib/documents/create-draft-quote-client';
import { openTradeQuote, tradeRoleToViewerRole } from '@/lib/trades/open-trade-quote';

import TransactionProgress from '@/features/dashboard/TransactionProgress';
import type { TradeApiRow, TradePhase, TradeRole } from '@/features/trade/types';

type SortOption = 'recentDesc' | 'recentAsc' | 'progressDesc' | 'progressAsc';

type ActiveRow = {
  trade: TradeApiRow;
  id: string;
  company: string;
  badgeText: string;
  badgeClassName: string;
  businessNumber: string;
  owner: string;
  itemSummary: string;
  progressStep: number;
  cancelled: boolean;
  date: string;
};

type CompletedRow = {
  trade: TradeApiRow;
  id: string;
  invoiceNo: string;
  counterpart: string;
  itemSummary: string;
  amount: string;
  completedDate: string;
};

const PHASE_OPTIONS: { id: TradePhase; label: string }[] = [
  { id: 'ACTIVE', label: '거래중' },
  { id: 'COMPLETED', label: '완료거래' },
];

const ROLE_OPTIONS_ACTIVE: { id: TradeRole; label: string }[] = [
  { id: 'SELLER', label: '수주중' },
  { id: 'BUYER', label: '발주중' },
];

const ROLE_OPTIONS_COMPLETED: { id: TradeRole; label: string }[] = [
  { id: 'SELLER', label: '수주거래' },
  { id: 'BUYER', label: '발주거래' },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recentDesc', label: '최근 거래순' },
  { id: 'recentAsc', label: '오래된 거래순' },
  { id: 'progressDesc', label: '진행도 높은순' },
  { id: 'progressAsc', label: '진행도 낮은순' },
];

function formatYmd(value?: string | null): string {
  if (!value) return '-';
  const m = value.match(/^(\d{4})[-.]?(\d{2})[-.]?(\d{2})/);
  if (!m) return value;
  return `${m[1]}.${m[2]}.${m[3]}`;
}

function formatWon(amount?: number): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '-';
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * PENDING_PO           → 0
 * PENDING_SELLER_SIGN  → 1
 * PENDING_INVOICE      → 2
 * PENDING_BUYER_CONFIRM→ 3
 * COMPLETED            → 4
 */
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

function badgeColorBySeed(seed: string): string {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-slate-500'];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % colors.length;
  return colors[Math.abs(hash) % colors.length];
}

function toActiveRow(trade: TradeApiRow): ActiveRow {
  const counterpart = trade.role === 'SELLER' ? trade.buyer : trade.seller;
  return {
    trade,
    id: String(trade.tradeId),
    company: counterpart.companyName,
    badgeText: (counterpart.companyName[0] ?? '거').toUpperCase(),
    badgeClassName: badgeColorBySeed(counterpart.companyName),
    businessNumber: counterpart.businessNumber,
    owner: counterpart.ceoName ?? '-',
    itemSummary: trade.itemsSummary || '-',
    progressStep: statusToProgressStep(trade.status),
    cancelled: trade.status === 'CANCELLED',
    date: formatYmd(trade.createdAt),
  };
}

function toCompletedRow(trade: TradeApiRow): CompletedRow {
  const counterpart = trade.role === 'SELLER' ? trade.buyer : trade.seller;
  return {
    trade,
    id: String(trade.tradeId),
    invoiceNo: trade.invoiceDocNumber || `INV-${trade.tradeId}`,
    counterpart: counterpart.companyName,
    itemSummary: trade.itemsSummary || '-',
    amount: formatWon(trade.totalAmount),
    completedDate: formatYmd(trade.completedAt || trade.createdAt),
  };
}

function parseTradeDate(value: string) {
  return new Date(value.replaceAll('.', '-')).getTime();
}

export type TradeBoardProps = {
  trades: TradeApiRow[];
  activeRole: TradeRole;
  activePhase: TradePhase;
  onRoleChange: (role: TradeRole) => void;
  onPhaseChange: (phase: TradePhase) => void;
  loading?: boolean;
};

export default function TradeBoard({
  trades,
  activeRole,
  activePhase,
  onRoleChange,
  onPhaseChange,
  loading = false,
}: TradeBoardProps) {
  const router = useRouter();
  const [activeSort, setActiveSort] = useState<SortOption>('recentDesc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [startingTrade, setStartingTrade] = useState(false);
  const [viewingTradeId, setViewingTradeId] = useState<number | null>(null);

  const handleViewTrade = async (trade: TradeApiRow) => {
    if (viewingTradeId != null || loading) return;
    setViewingTradeId(trade.tradeId);
    try {
      const quoteId = await openTradeQuote(trade, activeRole);
      const viewer = tradeRoleToViewerRole(activeRole);
      router.push(`/documents/quotes/${quoteId}?viewer=${viewer}`);
    } catch (error: unknown) {
      alert(
        error instanceof Error ? error.message : '견적서 화면으로 이동하지 못했습니다.',
      );
    } finally {
      setViewingTradeId(null);
    }
  };

  const handleStartTrade = async () => {
    if (startingTrade || loading) return;
    setStartingTrade(true);
    try {
      const { quoteId } = await createDraftQuoteViaApi({ asSupplier: true });
      router.push(`/documents/quotes/${quoteId}`);
    } catch (error: unknown) {
      alert(
        error instanceof Error ? error.message : '견적서 작성 화면으로 이동하지 못했습니다.',
      );
    } finally {
      setStartingTrade(false);
    }
  };

  // 서버가 role + phase 로 이미 필터링해서 내려줬으므로 그대로 사용
  const activeRows = useMemo<ActiveRow[]>(() => {
    if (activePhase !== 'ACTIVE') return [];
    const rows = trades.map(toActiveRow);
    return [...rows].sort((a, b) => {
      if (activeSort === 'recentDesc') return parseTradeDate(b.date) - parseTradeDate(a.date);
      if (activeSort === 'recentAsc') return parseTradeDate(a.date) - parseTradeDate(b.date);
      if (activeSort === 'progressDesc') return b.progressStep - a.progressStep;
      return a.progressStep - b.progressStep;
    });
  }, [trades, activePhase, activeSort]);

  const completedRows = useMemo<CompletedRow[]>(() => {
    if (activePhase !== 'COMPLETED') return [];
    return trades.map(toCompletedRow);
  }, [trades, activePhase]);

  const roleOptions = activePhase === 'COMPLETED' ? ROLE_OPTIONS_COMPLETED : ROLE_OPTIONS_ACTIVE;
  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.id === activeSort)?.label ?? '최근 거래순';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {PHASE_OPTIONS.map((option) => {
              const isActive = option.id === activePhase;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPhaseChange(option.id)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.id === 'ACTIVE' ? (
                    <ClipboardList className="h-3.5 w-3.5" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {option.label}
                </button>
              );
            })}
          </div>

          {activeRole === 'SELLER' && (
            <Button
              type="button"
              disabled={loading || startingTrade}
              onClick={() => void handleStartTrade()}
              className="h-10 shrink-0 rounded-xl border border-blue-600 bg-white px-4 text-sm font-semibold text-blue-600 shadow-[0_4px_14px_-4px_rgba(49,100,246,0.55)] hover:bg-blue-600 hover:text-white disabled:opacity-60"
            >
              {startingTrade ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              거래 시작
            </Button>
          )}
        </div>

        <div
          className={`rounded-2xl border border-slate-200 bg-white p-3 md:p-4 transition-opacity ${loading ? 'pointer-events-none opacity-50' : 'opacity-100'}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {roleOptions.map((option) => {
                const isActive = option.id === activeRole;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onRoleChange(option.id)}
                    className={`cursor-pointer rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortMenuOpen((prev) => !prev)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50"
              >
                <ArrowDownUp className="h-3.5 w-3.5" />
                {activeSortLabel}
              </button>
              {isSortMenuOpen && (
                <div className="absolute right-0 z-20 mt-1.5 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  {SORT_OPTIONS.map((option) => {
                    const isSelected = option.id === activeSort;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setActiveSort(option.id);
                          setIsSortMenuOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center rounded-md px-2.5 py-2 text-left text-xs ${
                          isSelected
                            ? 'bg-blue-50 font-semibold text-blue-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {activePhase === 'COMPLETED' ? (
            <div>
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '9%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] font-medium text-slate-400">
                    <th className="pb-3 pl-2 pr-2">Invoice 번호</th>
                    <th className="pb-3 pl-0 pr-2">거래처</th>
                    <th className="pb-3 pl-0 pr-2">품목</th>
                    <th className="pb-3 pl-0 pr-2">총액</th>
                    <th className="pb-3 pl-0 pr-2">완료일</th>
                    <th className="pb-3 pl-0 pr-2 text-right">확인</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && completedRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                        완료된 거래가 없습니다.
                      </td>
                    </tr>
                  )}
                  {completedRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pl-2 pr-2">
                        <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                          <p>{row.invoiceNo}</p>
                          <p className="mt-1 text-[10px] text-emerald-500">완료</p>
                        </div>
                      </td>
                      <td className="py-3 pl-0 pr-2 text-slate-700">{row.counterpart}</td>
                      <td className="py-3 pl-0 pr-2 font-semibold text-slate-700">
                        {row.itemSummary}
                      </td>
                      <td className="py-3 pl-0 pr-2 font-semibold text-slate-700">{row.amount}</td>
                      <td className="py-3 pl-0 pr-2 text-slate-600">{row.completedDate}</td>
                      <td className="py-3 pl-0 pr-2 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={loading || viewingTradeId === row.trade.tradeId}
                          onClick={() => void handleViewTrade(row.trade)}
                          className="h-8 w-20 rounded-lg border-blue-300 text-xs font-semibold text-blue-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {viewingTradeId === row.trade.tradeId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            '보기 →'
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '24%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '19%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] font-medium text-slate-400">
                    <th className="pb-3 pl-3 pr-2">
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-9 shrink-0" aria-hidden />
                        <span>거래처</span>
                      </div>
                    </th>
                    <th className="pb-3 pl-0 pr-2">사업자번호</th>
                    <th className="pb-3 pl-0 pr-2">대표자</th>
                    <th className="pb-3 pl-0 pr-2">거래품목</th>
                    <th className="pb-3 pl-0 pr-2">진행도</th>
                    <th className="pb-3 pl-0 pr-2">최근 거래</th>
                    <th className="pb-3 pl-0 pr-2 text-center">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && activeRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                        진행 중인 거래가 없습니다. 견적서(PI)를 발행하면 여기에 표시됩니다.
                      </td>
                    </tr>
                  )}
                  {activeRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-4 pl-3 pr-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${row.badgeClassName}`}
                          >
                            {row.badgeText}
                          </span>
                          <span className="font-bold text-slate-800">{row.company}</span>
                        </div>
                      </td>
                      <td className="py-4 pl-0 pr-2 text-slate-500">{row.businessNumber}</td>
                      <td className="py-4 pl-0 pr-2 text-slate-500">{row.owner}</td>
                      <td className="max-w-0 py-4 pl-0 pr-2">
                        <span
                          className="block truncate font-semibold text-slate-800"
                          title={row.itemSummary}
                        >
                          {row.itemSummary}
                        </span>
                      </td>
                      <td className="py-4 pl-0 pr-2">
                        <TransactionProgress
                          currentStep={row.progressStep}
                          cancelled={row.cancelled}
                        />
                      </td>
                      <td className="py-4 pl-0 pr-2 text-slate-600">{row.date}</td>
                      <td className="py-4 pl-0 pr-2">
                        <div className="flex flex-col items-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            disabled={loading || viewingTradeId === row.trade.tradeId}
                            onClick={() => void handleViewTrade(row.trade)}
                            className="h-8 w-24 rounded-lg px-3 text-xs font-semibold"
                          >
                            {viewingTradeId === row.trade.tradeId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              '거래보기'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-24 rounded-lg border-slate-200 px-3 text-xs font-semibold text-slate-500"
                          >
                            상세보기
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
