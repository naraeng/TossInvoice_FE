export default function Home() {
  const quickMenus = [
    { name: '주문하기', description: '필요 품목 즉시 발주', badge: '주요' },
    { name: '주문현황', description: '건별/품목별 조회', badge: '12건' },
    { name: '위시리스트', description: '자주 주문 품목 모음', badge: '28개' },
    { name: '외상/충전잔액', description: '미수/충전 내역 확인', badge: '확인' },
    { name: '간편결제관리', description: '결제수단/OTP 관리', badge: '보안' },
    { name: '내정보', description: '사업장/담당자 정보', badge: '설정' },
  ];

  const todaySummary = [
    { label: '오늘 발주', value: '14건', change: '+3' },
    { label: '승인 대기', value: '2건', change: '-1' },
    { label: '배송 진행', value: '5건', change: '+2' },
    { label: '미수 잔액', value: '1,280,000원', change: '확인 필요' },
  ];

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

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
            TI
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">Toss Invoice</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a className="transition hover:text-blue-600" href="#overview">
            서비스 소개
          </a>
          <a className="transition hover:text-blue-600" href="#matching">
            기업 매칭
          </a>
          <a className="transition hover:text-blue-600" href="#order-request">
            발주 신청
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
            로그인
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            주문하기
          </button>
        </div>
      </div>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-20 pt-8 md:px-10">
        <section
          id="overview"
          className="rounded-3xl border border-blue-100/70 bg-white/90 px-6 pb-6 pt-6 shadow-[0_14px_36px_-24px_rgba(37,99,235,0.35)] backdrop-blur-xl md:px-8"
        >
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                안녕하세요, 날애커피 발주 담당자님
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                오늘 필요한 업무를 바로 시작하세요
              </h1>
            </div>
            <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              발주 신청 시작
            </button>
          </header>

          <div className="grid gap-3 md:grid-cols-4">
            {todaySummary.map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs font-semibold text-blue-600">{item.change}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="order-request" className="grid gap-4 md:grid-cols-3">
          {quickMenus.map((menu) => (
            <article
              key={menu.name}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_45px_-30px_rgba(37,99,235,0.55)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{menu.name}</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {menu.badge}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{menu.description}</p>
              <button className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                바로가기
              </button>
            </article>
          ))}
        </section>

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
