import Link from 'next/link';

import { Button } from '@/components/ui/button';

type DashboardHeaderProps = {
  companyName?: string;
  ceoName?: string;
  /** 헤드라인 카운트 — sellingInProgress.total + buyingInProgress.total */
  todayActiveCount?: number;

  /** 진행 중 수주 KPI */
  sellingTotal?: number;
  sellingAwaitingCounterSign?: number;

  /** 진행 중 발주 KPI */
  buyingTotal?: number;
  buyingPoInProgress?: number;
  buyingDeliveryWaiting?: number;
  buyingInspectionWaiting?: number;

  /** 결제 대기 KPI */
  pendingPaymentAmount?: number;
  depositCount?: number;
  balanceCount?: number;

  /** 이번 달 발주액 KPI */
  thisMonthBuyAmount?: number;
  thisMonthBuyDelta?: number; // 0 이상 절댓값
  thisMonthBuyDirection?: string; // 'UP' | 'DOWN' | 'FLAT'
};

function formatWon(amount: number): string {
  if (amount === 0) return '-';
  return `${amount.toLocaleString('ko-KR')}원`;
}

export default function DashboardHeader({
  companyName,
  ceoName,
  todayActiveCount = 0,
  sellingTotal = 0,
  sellingAwaitingCounterSign = 0,
  buyingTotal = 0,
  buyingPoInProgress = 0,
  buyingDeliveryWaiting = 0,
  buyingInspectionWaiting = 0,
  pendingPaymentAmount = 0,
  depositCount = 0,
  balanceCount = 0,
  thisMonthBuyAmount = 0,
  thisMonthBuyDelta = 0,
  thisMonthBuyDirection = 'FLAT',
}: DashboardHeaderProps) {
  const greeting = companyName
    ? ceoName
      ? `안녕하세요, ${companyName} ${ceoName}님`
      : `안녕하세요, ${companyName}`
    : '안녕하세요';

  // 진행 중 수주 서브라벨 — 발주서 검토 대기 N건
  const sellingSubLabel =
    sellingAwaitingCounterSign > 0
      ? `발주서 검토 대기 +${sellingAwaitingCounterSign}`
      : '대기 없음';

  // 진행 중 발주 서브라벨 — PO 발행 / 납품 대기 / 검수 대기
  const buyingSubLabel = (() => {
    const parts: string[] = [];
    if (buyingPoInProgress > 0) parts.push(`PO 발행 ${buyingPoInProgress}`);
    if (buyingDeliveryWaiting > 0) parts.push(`납품 대기 ${buyingDeliveryWaiting}`);
    if (buyingInspectionWaiting > 0) parts.push(`검수 대기 ${buyingInspectionWaiting}`);
    if (parts.length === 0) return '대기 없음';
    return parts.join(' · ');
  })();

  // 결제 대기 서브라벨 — 선금 N / 잔금 M
  const paymentSubLabel = (() => {
    const parts: string[] = [];
    if (depositCount > 0) parts.push(`선금 ${depositCount}건`);
    if (balanceCount > 0) parts.push(`잔금 ${balanceCount}건`);
    if (parts.length === 0) return '대기 없음';
    return parts.join(' · ');
  })();

  // 이번 달 발주액 — 증감 표시
  const buyChange = (() => {
    if (thisMonthBuyDirection === 'UP') return `▲ ${thisMonthBuyDelta}%`;
    if (thisMonthBuyDirection === 'DOWN') return `▼ ${thisMonthBuyDelta}%`;
    return '전월과 동일';
  })();

  const buyAccent =
    thisMonthBuyDirection === 'UP'
      ? 'text-red-500'
      : thisMonthBuyDirection === 'DOWN'
        ? 'text-emerald-600'
        : 'text-slate-400';

  // 백엔드 spec 그대로 — KPI 4종 (수주/발주/결제대기/이번달 발주액)
  const kpiCards = [
    {
      label: '진행 중 수주',
      value: `${sellingTotal}건`,
      change: sellingSubLabel,
      accent: sellingAwaitingCounterSign > 0 ? 'text-amber-500' : 'text-slate-400',
    },
    {
      label: '진행 중 발주',
      value: `${buyingTotal}건`,
      change: buyingSubLabel,
      accent: buyingTotal > 0 ? 'text-blue-600' : 'text-slate-400',
    },
    {
      label: '결제 대기',
      value: formatWon(pendingPaymentAmount),
      change: paymentSubLabel,
      accent: 'text-slate-500',
    },
    {
      label: '이번 달 발주액',
      value: formatWon(thisMonthBuyAmount),
      change: buyChange,
      accent: buyAccent,
    },
  ];

  return (
    <section id="overview" className="mb-1">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-600">{greeting}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {todayActiveCount > 0
              ? `오늘 진행할 거래 ${todayActiveCount}건이 기다리고 있어요`
              : '현재 진행 중인 거래가 없어요'}
          </h1>
        </div>
        <Button asChild className="h-10 rounded-xl px-4 text-sm font-semibold">
          <Link href="/trade">거래 목록 보기</Link>
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        {kpiCards.map((item) => (
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
