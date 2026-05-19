'use client';

import { useEffect, useMemo, useState } from 'react';

import type { MonthlyTrendItem } from '@/app/dashboard/page';

type GraphEntry = {
  label: string;   // "5월"
  order: number;   // buyingAmount / 10000 (만원)
  receive: number; // sellingAmount / 10000 (만원)
};

function buildEntries(monthlyTrend: MonthlyTrendItem[]): GraphEntry[] {
  return monthlyTrend.map((item) => {
    const [, mm] = item.month.split('-');
    return {
      label: `${parseInt(mm, 10)}월`,
      order: Math.round(item.buyingAmount / 10000),
      receive: Math.round(item.sellingAmount / 10000),
    };
  });
}

type Props = { monthlyTrend: MonthlyTrendItem[] };

export default function MonthlyGraph({ monthlyTrend }: Props) {
  const [isRising, setIsRising] = useState(false);

  const entries = useMemo(() => buildEntries(monthlyTrend), [monthlyTrend]);

  const maxValue = Math.max(
    ...entries.flatMap((e) => [e.order, e.receive]),
    1,
  );

  useEffect(() => {
    setIsRising(false);
    const frame = window.requestAnimationFrame(() => setIsRising(true));
    return () => window.cancelAnimationFrame(frame);
  }, [monthlyTrend]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-[0_10px_35px_-30px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">월별 거래 추이</h2>
          <p className="mt-2 text-sm text-slate-500">최근 6개월 발주·수주 금액 (단위: 만원)</p>
        </div>
      </div>

      <div className="mt-10 min-h-[230px]">
        {entries.length === 0 ? (
          <div className="flex h-44 items-center justify-center text-sm text-slate-400">
            데이터가 없습니다
          </div>
        ) : (
          <div
            className="grid items-end gap-8"
            style={{ gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))` }}
          >
            {entries.map((data) => {
              const orderHeight = (data.order / maxValue) * 100;
              const receiveHeight = (data.receive / maxValue) * 100;

              return (
                <div key={data.label} className="flex flex-col items-center gap-4">
                  <div className="flex h-44 items-end gap-2">
                    <div className="group relative flex h-full items-end">
                      <div
                        className="w-8 rounded-t-md bg-blue-500 transition-[height] duration-700 ease-out"
                        style={{ height: isRising ? `${orderHeight}%` : '0%' }}
                      />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                        발주 {data.order.toLocaleString()}만원
                      </div>
                    </div>
                    <div className="group relative flex h-full items-end">
                      <div
                        className="w-8 rounded-t-md bg-blue-100 transition-[height] duration-700 ease-out"
                        style={{ height: isRising ? `${receiveHeight}%` : '0%' }}
                      />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                        수주 {data.receive.toLocaleString()}만원
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500">{data.label}</p>
                </div>
              );
            })}
          </div>
        )}

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
