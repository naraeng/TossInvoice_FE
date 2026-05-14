'use client';

import { useEffect, useState } from 'react';

type Period = 'daily' | 'monthly' | 'yearly';

const graphData = {
  daily: {
    title: '일별 거래 추이',
    description: '최근 7일 발주·수주 건수',
    labels: ['목', '금', '토', '일', '월', '화', '수'],
    unit: '건',
    values: [
      { order: 34, receive: 22 },
      { order: 48, receive: 38 },
      { order: 28, receive: 18 },
      { order: 20, receive: 14 },
      { order: 62, receive: 44 },
      { order: 54, receive: 59 },
      { order: 72, receive: 51 },
    ],
  },
  monthly: {
    title: '월별 거래 추이',
    description: '최근 6개월 발주·수주 금액 (단위: 만원)',
    labels: ['12월', '1월', '2월', '3월', '4월', '5월'],
    unit: '만원',
    values: [
      { order: 420, receive: 310 },
      { order: 520, receive: 420 },
      { order: 360, receive: 470 },
      { order: 680, receive: 520 },
      { order: 580, receive: 680 },
      { order: 840, receive: 630 },
    ],
  },
  yearly: {
    title: '년도별 거래 추이',
    description: '최근 5년 발주·수주 금액 (단위: 만원)',
    labels: ['2022', '2023', '2024', '2025', '2026'],
    unit: '만원',
    values: [
      { order: 3200, receive: 2800 },
      { order: 4600, receive: 3900 },
      { order: 5400, receive: 5100 },
      { order: 7200, receive: 6400 },
      { order: 8600, receive: 7300 },
    ],
  },
};

const periodLabels: Record<Period, string> = {
  daily: '일별',
  monthly: '월별',
  yearly: '년도별',
};

export default function MonthlyGraph() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [isRising, setIsRising] = useState(false);
  const selectedData = graphData[period];
  const maxValue = Math.max(
    ...selectedData.values.flatMap((value) => [value.order, value.receive])
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsRising(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [period]);

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
                if (period !== item) {
                  setIsRising(false);
                  setPeriod(item);
                }
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
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
                      발주 {data.order.toLocaleString()}
                      {selectedData.unit}
                    </div>
                  </div>
                  <div className="group relative flex h-full items-end">
                    <div
                      className="w-8 rounded-t-md bg-blue-100 transition-[height] duration-700 ease-out"
                      style={{ height: isRising ? `${receiveHeight}%` : '0%' }}
                    />
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                      수주 {data.receive.toLocaleString()}
                      {selectedData.unit}
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
