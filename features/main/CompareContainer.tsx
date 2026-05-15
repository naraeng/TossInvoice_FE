export default function CompareContainer() {
  const erpIssues = [
    { icon: '📧', text: '이메일로 통장사본·세금계산서 송수신' },
    { icon: '🏷️', text: '거래처마다 수기 등록·오기입 발생' },
    { icon: '⚠️', text: '계좌 변경 시 별도 연락·알림 누락' },
    { icon: '🔴', text: 'BEC 사기·사칭 계좌로 오송금' },
  ];

  const safeFeatures = [
    '거래처 검색 한 번으로 검증된 정보 연결',
    'OCR + 은행 검증으로 통록 즉시 신뢰',
    '계좌 변경 자동 동기화·거래처 즉시 알림',
    '조건부 안전결제로 사기 피해 0건',
  ];

  return (
    <section id="compare" className="py-16 scroll-mt-16">
      <div className="mx-auto w-full px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">수기로 거래하던 방식, 이제 그만.</h2>
          <p className="mt-3 text-base text-slate-600">거래 정보가 외부로 새지 않습니다</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="mb-6 inline-block rounded-full bg-red-50 px-3 py-1.5">
              <p className="text-xs font-semibold text-red-600">수기 거래</p>
            </div>
            <h3 className="text-xl font-bold text-slate-900">거래처 정보를 매번 주고받음</h3>
            <div className="mt-6 space-y-3">
              {erpIssues.map((issue) => (
                <div
                  key={issue.text}
                  className="flex h-14 items-center gap-3 rounded-2xl bg-slate-100 px-4"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-2xl leading-none">
                    {issue.icon}
                  </span>
                  <p className="text-sm font-medium leading-5 text-slate-700">{issue.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="h-full rounded-3xl border border-blue-300 bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white shadow-lg">
            <div className="mb-6 inline-block rounded-full bg-white/20 px-3 py-1.5">
              <p className="text-xs font-semibold text-white">Toss Invoice 안전결제</p>
            </div>
            <h3 className="text-xl font-bold">은행이 중앙에서 모든 정보를 검증</h3>
            <div className="mt-6 space-y-3">
              {safeFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex h-14 items-center gap-3 rounded-2xl bg-white/10 px-4 backdrop-blur-sm"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  </div>
                  <p className="text-sm font-medium leading-5 text-white">{feature}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
