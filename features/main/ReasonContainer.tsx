export default function ReasonContainer() {
  const userJourneys = [
    {
      icon: '🔒',
      title: '통장사본 없는 거래',
      description: (
        <>
          계좌·사업자 정보는 <br />
          은행이 중앙 관리합니다.
          <br /> 매번 주고받을 필요 없이
          <br /> 검색 한 번으로 끝.
        </>
      ),
    },
    {
      icon: '🔄',
      title: '계좌 변경 자동 동기화',
      description: (
        <>
          거래처 계좌가 바뀌면
          <br /> 관련 기업에 자동 알림.
          <br /> 피싱·사칭 계좌
          <br /> 변경 사기를 원천 차단합니다.
        </>
      ),
    },
    {
      icon: '🛡️',
      title: '조건부 안전거래',
      description: (
        <>
          선금/잔금/납품완료 등<br /> 조건이 충족돼야만
          <br /> 은행이 자동으로 송금.
          <br /> OTP는 마지막에 한 번만.
        </>
      ),
    },
  ];
  return (
    <section id="reason" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
            왜 Toss Invoice인가요?
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            기존에는 거래를 '기록'하지만, Toss Invoice는 거래를 '만들고 결제까지' 합니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {userJourneys.map((journey) => (
            <article
              key={journey.title}
              className="rounded-3xl border border-slate-200/80 bg-white p-10 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_45px_-30px_rgba(37,99,235,0.18)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-2xl">
                {journey.icon}
              </div>
              <h2 className="mt-8 text-2xl font-bold text-slate-900">{journey.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{journey.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
