import Link from 'next/link';

import { Button } from '@/components/ui/button';

type DashboardHeaderProps = {
  companyName?: string;
  ceoName?: string;
  inProgressCount?: number;
  pendingCount?: number;
  pendingPaymentAmount?: number;
  monthlyNetAmount?: number;
};

function formatWon(amount: number): string {
  if (amount === 0) return '-';
  return `${amount.toLocaleString('ko-KR')}원`;
}

function formatNetWon(amount: number): string {
  if (amount === 0) return '-';
  const sign = amount > 0 ? '+' : '';
  return `${sign}${amount.toLocaleString('ko-KR')}원`;
}

export default function DashboardHeader({
  companyName,
  ceoName,
  inProgressCount = 0,
  pendingCount = 0,
  pendingPaymentAmount = 0,
  monthlyNetAmount = 0,
}: DashboardHeaderProps) {
  const greeting = companyName
    ? ceoName
      ? `안녕하세요, ${companyName} ${ceoName}님`
      : `안녕하세요, ${companyName}`
    : '안녕하세요';

  const todaySummary = [
    {
      label: '진행 중 거래',
      value: `${inProgressCount}건`,
      change: inProgressCount > 0 ? '진행 중' : '없음',
      accent: 'text-blue-600',
    },
    {
      label: '승인 대기',
      value: `${pendingCount}건`,
      change: pendingCount > 0 ? '확인 필요' : '없음',
      accent: pendingCount > 0 ? 'text-amber-500' : 'text-slate-400',
    },
    {
      label: '입금 예정',
      value: formatWon(pendingPaymentAmount),
      change: '이번 주',
      accent: 'text-slate-500',
    },
    {
      label: '이번 달 순손익',
      value: formatNetWon(monthlyNetAmount),
      change: monthlyNetAmount > 0 ? '수주 - 발주' : monthlyNetAmount < 0 ? '발주 초과' : '-',
      accent: monthlyNetAmount > 0 ? 'text-emerald-600' : monthlyNetAmount < 0 ? 'text-red-500' : 'text-slate-400',
    },
  ];

  return (
    <section id="overview" className="mb-1">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-600">{greeting}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {inProgressCount > 0
              ? `현재 ${inProgressCount}건의 거래가 진행중이에요`
              : '현재 진행 중인 거래가 없어요'}
          </h1>
        </div>
        <Button asChild className="h-10 rounded-xl px-4 text-sm font-semibold">
          <Link href="/trade">거래 목록 보기</Link>
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        {todaySummary.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <p className="text-xs font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{item.value}</p>
            <p className={`mt-1 text-xs font-semibold ${item.accent}`}>{item.change}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
