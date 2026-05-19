export default function ProcessContainer() {
  const processSteps = [
    {
      step: '01',
      title: '회원가입',
      description: '사업자등록증 + 통장사본 업로드.\nOCR이 자동으로 읽어\n은행 검증을 통과시킵니다.',
    },
    {
      step: '02',
      title: '거래처 연결',
      description: '사업자번호로 검색하면\n이미 등록된 거래처를\n한 번에 연결합니다.',
    },
    {
      step: '03',
      title: '안전거래로 거래',
      description: '발주 -> 검증 -> 조건부 송금까지\n모두 시스템 안에서 진행.\n계좌번호는 어디에도 노출되지 않습니다.',
    },
  ];

  return (
    <section id="process" className="py-14">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">3단계로 시작합니다</h2>
        <p className="mt-3 text-sm text-slate-500">회원가입 후 5분이면 첫 거래를 보낼 수 있어요</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {processSteps.map((step) => (
          <article
            key={step.step}
            className="min-h-[260px] rounded-2xl border border-slate-200 bg-white px-8 py-7 shadow-[0_10px_30px_-26px_rgba(15,23,42,0.35)]"
          >
            <p className="text-sm font-bold text-blue-600">{step.step}</p>
            <h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3>
            <p className="mt-6 whitespace-pre-line text-sm leading-5 text-slate-500">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
