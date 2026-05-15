import DashboardHeader from '@/features/dashboard/DashboardHeader';
import MonthlyGraph from '@/features/dashboard/MonthlyGraph';
import NoticeList from '@/features/dashboard/NoticeList';

export default function Home() {
  const recentOrders = [
    { id: 'PO-240508-001', vendor: '장규식자재', amount: '420,000원', status: '승인 대기' },
    { id: 'PO-240508-002', vendor: '수민유통', amount: '188,000원', status: '배송 준비' },
    { id: 'PO-240507-103', vendor: '정현기업', amount: '950,000원', status: '결제 완료' },
    { id: 'PO-240507-098', vendor: '준플라워', amount: '76,000원', status: '검증 경고' },
  ];

  const notices = [
    '[필독] 거래처 계좌 변경 승인 정책이 업데이트되었습니다.',
    '정기 점검 안내: 5/12(월) 02:00~04:00',
    '신규 기능: 거래처 추천 정확도가 개선되었습니다.',
  ];

  return (
    <div className="relative overflow-hidden bg-[#f6f9ff] text-slate-900">
      <div className="pointer-events-none absolute -top-52 left-1/2 h-152 w-152 -translate-x-1/2 rounded-full bg-blue-500/25 blur-[140px]" />
      <div className="pointer-events-none absolute -left-20 top-152 h-80 w-80 rounded-full bg-sky-400/20 blur-[120px]" />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-20 pt-8 md:px-10">
        <DashboardHeader />
        <div className="grid gap-4 lg:grid-cols-[2fr_0.9fr]">
          <MonthlyGraph />
          <NoticeList />
        </div>
        <section id="matching" className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">최근 발주 내역</h3>
              <button className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                전체 보기
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-slate-700">{order.id}</span>
                  <span className="text-slate-600">{order.vendor}</span>
                  <span className="font-semibold text-slate-900">{order.amount}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)]">
            <h3 className="text-xl font-bold text-slate-900">공지사항</h3>
            <ul className="mt-4 space-y-2">
              {notices.map((notice) => (
                <li
                  key={notice}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
                >
                  {notice}
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-700">보안 알림</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                거래처 계좌/상호 동시 변경 감지 시 자동으로 재인증이 요청됩니다.
              </p>
              <button className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-600 hover:text-white">
                정책 확인
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
