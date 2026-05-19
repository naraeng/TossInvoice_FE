'use client';

import { useEffect, useMemo, useState } from 'react';

import type { TradeApiRow } from '@/features/trade/types';

type Period = 'daily' | 'monthly' | 'yearly';

type GraphData = {
  title: string;
  description: string;
  labels: string[];
  unit: string;
  values: { order: number; receive: number }[];
};

const periodLabels: Record<Period, string> = {
  daily: '일별',
  monthly: '월별',
  yearly: '년도별',
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

function buildGraphData(trades: TradeApiRow[]): Record<Period, GraphData> {
  const now = new Date();

  // ── 일별: 최근 7일 건수 ───────────────────────────────────────────────────
  const dayLabels: string[] = [];
  const dayValues: { order: number; receive: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayLabels.push(DAY_NAMES[d.getDay()]);
    const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const dayTrades = trades.filter((t) => t.createdAt.slice(0, 10) === dateStr);
    dayValues.push({
      order: dayTrades.filter((t) => t.role === 'BUYER').length,
      receive: dayTrades.filter((t) => t.role === 'SELLER').length,
    });
  }

  // ── 월별: 최근 6개월 금액 (만원) ─────────────────────────────────────────
  const monthLabels: string[] = [];
  const monthValues: { order: number; receive: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(`${d.getMonth() + 1}월`);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthTrades = trades.filter((t) => {
      const td = new Date(t.createdAt);
      return td.getFullYear() === y && td.getMonth() === m;
    });
    monthValues.push({
      order: Math.round(
        monthTrades.filter((t) => t.role === 'BUYER').reduce((s, t) => s + (t.totalAmount ?? 0), 0) / 10000,
      ),
      receive: Math.round(
        monthTrades.filter((t) => t.role === 'SELLER').reduce((s, t) => s + (t.totalAmount ?? 0), 0) / 10000,
      ),
    });
  }

  // ── 년도별: 최근 5년 금액 (만원) ─────────────────────────────────────────
  const yearLabels: string[] = [];
  const yearValues: { order: number; receive: number }[] = [];
  const currentYear = now.getFullYear();

  for (let y = currentYear - 4; y <= currentYear; y++) {
    yearLabels.push(String(y));
    const yearTrades = trades.filter((t) => new Date(t.createdAt).getFullYear() === y);
    yearValues.push({
      order: Math.round(
        yearTrades.filter((t) => t.role === 'BUYER').reduce((s, t) => s + (t.totalAmount ?? 0), 0) / 10000,
      ),
      receive: Math.round(
        yearTrades.filter((t) => t.role === 'SELLER').reduce((s, t) => s + (t.totalAmount ?? 0), 0) / 10000,
      ),
    });
  }

  return {
    daily: {
      title: '일별 거래 추이',
      description: '최근 7일 발주·수주 건수',
      labels: dayLabels,
      unit: '건',
      values: dayValues,
    },
    monthly: {
      title: '월별 거래 추이',
      description: '최근 6개월 발주·수주 금액 (단위: 만원)',
      labels: monthLabels,
      unit: '만원',
      values: monthValues,
    },
    yearly: {
      title: '년도별 거래 추이',
      description: '최근 5년 발주·수주 금액 (단위: 만원)',
      labels: yearLabels,
      unit: '만원',
      values: yearValues,
    },
  };
}

type Props = { trades?: TradeApiRow[] };

export default function MonthlyGraph({ trades = [] }: Props) {
  const [period, setPeriod] = useState<Period>('monthly');
  const [isRising, setIsRising] = useState(false);

  const graphData = useMemo(() => buildGraphData(trades), [trades]);
  const selectedData = graphData[period];

  // 0 방어: 모든 값이 0일 때 막대 높이 계산이 깨지지 않도록
  const maxValue = Math.max(
    ...selectedData.values.flatMap((v) => [v.order, v.receive]),
    1,
  );

  useEffect(() => {
    setIsRising(false);
    const frame = window.requestAnimationFrame(() => setIsRising(true));
    return () => window.cancelAnimationFrame(frame);
  }, [period, trades]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-[0_10px_35px_-30px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{selectedData.title}</h2>
          <p className="mt-2 text-sm text-slate-500">{selectedData.description}</p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-1">
          {(Object.keys(periodLabels) as Period[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (period !== item) setPeriod(item);
              }}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                period === item ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {periodLabels[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 min-h-[230px]">
        <div
          className="grid items-end gap-8"
          style={{ gridTemplateColumns: `repeat(${selectedData.labels.length}, minmax(0, 1fr))` }}
        >
          {selectedData.values.map((data, index) => {
            const orderHeight = (data.order / maxValue) * 100;
            const receiveHeight = (data.receive / maxValue) * 100;

            return (
              <div key={selectedData.labels[index]} className="flex flex-col items-center gap-4">
                <div className="flex h-44 items-end gap-2">
                  <div className="group relative flex h-full items-end">
                    <div
                      className="w-8 rounded-t-md bg-blue-500 transition-[height] duration-700 ease-out"
                      style={{ height: isRising ? `${orderHeight}%` : '0%' }}
                    />
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                      발주 {data.order.toLocaleString()}{selectedData.unit}
                    </div>
                  </div>
                  <div className="group relative flex h-full items-end">
                    <div
                      className="w-8 rounded-t-md bg-blue-100 transition-[height] duration-700 ease-out"
                      style={{ height: isRising ? `${receiveHeight}%` : '0%' }}
                    />
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                      수주 {data.receive.toLocaleString()}{selectedData.unit}
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-500">{selectedData.labels[index]}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            발주
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-200" />
            수주
          </span>
        </div>
      </div>
    </section>
  );
}
