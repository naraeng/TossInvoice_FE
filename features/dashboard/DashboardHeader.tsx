import Link from 'next/link';

export default function DashboardHeader() {
  const todaySummary = [
    {
      label: '진행 중 거래',
      value: '14건',
      change: '▲ +3',
      accent: 'text-blue-600',
    },
    {
      label: '승인 대기',
      value: '2건',
      change: '확인 필요',
      accent: 'text-amber-500',
    },
    {
      label: '입금 예정',
      value: '9,432,120원',
      change: '이번 주',
      accent: 'text-slate-500',
    },
    {
      label: '이번 달 거래액',
      value: '59,280,000원',
      change: '▲ +12%',
      accent: 'text-emerald-600',
    },
  ];
  return (
    <section id="overview" className="mb-1">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="ml-4">
          <p className="text-sm font-semibold text-blue-600">안녕하세요, 날애커피 날애님</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            오늘 진행할 거래 4건이 기다리고 있어요
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/documents/quotes/new"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            견적서 작성
          </Link>
          <Link
            href="/documents/quotes/quote-client-demo"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            받은 견적 확인
          </Link>
          <Link
            href="/documents/quotes/quote-po-confirmed"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            인보이스 발행
          </Link>
        </div>
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
