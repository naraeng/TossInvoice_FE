export type TradeHeaderProps = {
  totalPartners: number;
  activePartners: number;
  newPartnersThisMonth: number;
};

export default function TradeHeader({
  totalPartners,
  activePartners,
  newPartnersThisMonth,
}: TradeHeaderProps) {
  const statCards = [
    { label: '총 거래처', value: totalPartners, valueClassName: 'text-slate-900' },
    { label: '거래 중', value: activePartners, valueClassName: 'text-blue-600' },
    { label: '이번 달 신규', value: newPartnersThisMonth, valueClassName: 'text-emerald-600' },
  ] as const;

  return (
    <section className="py-1">
      <div className="flex items-start justify-between gap-8">
        <div className="w-[620px] shrink-0">
          <p className="text-xs font-semibold text-slate-400">거래</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">거래 관리</h1>
          <p className="mt-2 text-sm text-slate-500">
            거래를 시작하려면 우측 거래시작 버튼을 눌러 견적서(PI)를 발행하세요
          </p>
        </div>

        <div
          className="ml-auto shrink-0"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 170px)',
            gap: '12px',
            justifyItems: 'stretch',
          }}
        >
          {statCards.map((card) => (
            <article
              key={card.label}
              className="h-[112px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-[11px] font-medium text-slate-400">{card.label}</p>
              <p className={`mt-1 text-2xl font-bold ${card.valueClassName}`}>{card.value}개</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
