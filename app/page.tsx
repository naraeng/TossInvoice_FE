import { Button } from '@/components/ui/button';
import MainContainer from '@/features/main/MainContainer';

export default function Home() {
  const trustHighlights = [
    {
      title: '기업 중앙 등록',
      description: '사업자 등록증과 통장 사본 제출 후 사업자 상태와 예금주 실명을 이중 검증합니다.',
    },
    {
      title: '거래처 변경 실시간 알림',
      description:
        '계좌/상호/담당자 변경 시 즉시 알림을 보내고, 고위험 조합 변경은 강제 재인증을 요청합니다.',
    },
    {
      title: '검증된 계좌 이체',
      description:
        '직접 계좌 입력 없이 검증 완료된 계좌로만 이체하며, 은행 OTP 최종 승인으로 마무리합니다.',
    },
  ];

  const userJourneys = [
    {
      user: '발주처(소상공인/기업)',
      title: '필요한 품목을 빠르게 발주',
      steps: ['거래처 검색 / 추천', '발주서 작성', '인보이스 대조 후 승인', '간편 이체'],
    },
    {
      user: '수주처(공급사/기업)',
      title: '안전하게 수주하고 대금 수령',
      steps: [
        '기업 인증 완료',
        '플랫폼 내 인보이스 제출',
        '변경 알림 자동 동기화',
        '검증 계좌 수령',
      ],
    },
  ];

  const processSteps = [
    '발주서 생성: 수주처 인증 상태 자동 확인',
    '플랫폼 내 인보이스 수신: 이메일 기반 BEC 공격 차단',
    '담당자 승인: 발주서와 인보이스 금액/품목 자동 비교',
    '결제 실행: 권한/금액 검증 후 OTP 기반 이체',
  ];

  const changeRiskCases = [
    { type: '일반 변경', example: '담당자 연락처 단일 변경', action: '알림 후 확인' },
    { type: '주의 변경', example: '계좌번호 단일 변경', action: '재확인 요청' },
    { type: '고위험 변경', example: '계좌 + 상호 동시 변경', action: '강제 재인증' },
  ];

  const expansionTracks = [
    {
      title: '소상공인 친화 UX',
      description:
        '간단한 온보딩과 쉬운 발주 플로우로 디지털 숙련도가 낮아도 바로 사용 가능합니다.',
    },
    {
      title: '기업형 통제/권한 확장',
      description: '부서별 승인선, 다중 담당자 권한, 대량 발주 검토 체계로 B2B 운영에 대응합니다.',
    },
    {
      title: '통합 거래 네트워크',
      description: '발주처-수주처 연결 데이터를 기반으로 더 많은 기업 간 신뢰 거래를 확장합니다.',
    },
  ];

  const quickActions = [
    {
      title: '발주 신청서 작성',
      description: '품목/수량/납기일 입력 후 바로 신청',
      cta: '신청서 만들기',
    },
    {
      title: '기업 매칭 시작',
      description: '검증된 공급사 추천과 조건 비교',
      cta: '매칭 열기',
    },
    {
      title: '진행 건 확인',
      description: '승인 대기, 검증 경고, 이체 상태 확인',
      cta: '진행 현황 보기',
    },
  ];

  return (
    <div>
      <div className="relative overflow-hidden bg-[#f6f9ff] text-slate-900">
        <MainContainer />

        <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-8 md:px-10">
          <section
            id="overview"
            className="rounded-3xl border border-blue-100/70 bg-white/85 px-6 pb-8 pt-6 shadow-[0_16px_60px_-28px_rgba(37,99,235,0.45)] backdrop-blur-xl md:px-10 md:pb-10 md:pt-8"
          >
            <header className="mb-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold tracking-[0.06em] text-blue-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                PI/PO 통합 거래 플랫폼
              </div>
              <button className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">
                파트너 연결
              </button>
            </header>

            <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
              <div className="space-y-6">
                <p className="text-sm font-semibold text-blue-600">업무 시작 홈</p>
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900">
                  가입과 동시에 등록까지,
                  <br />
                  간편하고 안전하게 발주 신청 시작하기
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                  Toss Invoice는 발주처와 수주처가 간편하고 안전하게 거래할 수 있게 도와주는
                  플랫폼입니다. 지금 바로 거래를 시작하세요 !
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    id="order-request"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    발주 신청 시작하기
                  </button>
                  <button className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700">
                    기업 매칭 바로가기
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">우리가 미는</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">강점들 적으면</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">좋을 것 가타요</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">해시태그 형식으로다가</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">넘 올드한가</span>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_45px_-28px_rgba(2,132,199,0.8)]">
                {quickActions.map((action) => (
                  <article
                    key={action.title}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <h3 className="text-sm font-semibold text-slate-900">{action.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{action.description}</p>
                    <button className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-600 hover:text-white">
                      {action.cta}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="matching" className="grid gap-4 md:grid-cols-2">
            {userJourneys.map((journey) => (
              <article
                key={journey.user}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_45px_-30px_rgba(37,99,235,0.55)]"
              >
                <p className="text-sm font-semibold text-blue-600">{journey.user}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{journey.title}</h2>
                <ul className="mt-4 space-y-2">
                  {journey.steps.map((step) => (
                    <li
                      key={step}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      {step}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {trustHighlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_45px_-30px_rgba(37,99,235,0.55)]"
              >
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)]">
              <p className="text-sm font-semibold text-blue-600">Workflow</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">발주 → 검증 → 승인 → 이체</h3>
              <ol className="mt-6 space-y-3">
                {processSteps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50/70"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium leading-6 text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="rounded-2xl border border-blue-100/90 bg-linear-to-b from-blue-600 to-blue-700 p-6 text-white shadow-[0_14px_36px_-24px_rgba(29,78,216,0.9)]">
              <p className="text-sm font-semibold text-blue-100">Transfer Safety</p>
              <h3 className="mt-2 text-2xl font-bold">OTP 기반 이체 게이트</h3>
              <div className="mt-6 space-y-3 text-sm text-blue-50">
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  프론트: OTP 입력 + 이체 요청
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  백엔드: 금액/계좌/권한 검증
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  은행 API: 실제 이체 실행 및 결과 회신
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  사용자: 성공/실패 확인 화면
                </div>
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold text-blue-600">Risk Policy</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">변경 유형별 자동 대응</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {changeRiskCases.map((risk) => (
                <div
                  key={risk.type}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/60"
                >
                  <p className="text-sm font-semibold text-slate-900">{risk.type}</p>
                  <p className="mt-2 text-sm text-slate-600">{risk.example}</p>
                  <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                    {risk.action}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {expansionTracks.map((track) => (
              <article
                key={track.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_45px_-30px_rgba(37,99,235,0.55)]"
              >
                <h3 className="text-lg font-semibold text-slate-900">{track.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{track.description}</p>
              </article>
            ))}
          </section>

          <section className="rounded-3xl bg-slate-950 px-6 py-10 text-white md:px-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-300">
                  발주처와 수주처가 함께 쓰는 거래 표준을 시작하세요
                </p>
                <h3 className="mt-2 text-3xl font-bold leading-tight">
                  오늘은 소상공인 발주, 내일은 기업 간 거래까지
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-400">
                  발주처로 시작하기
                </button>
                <button className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20">
                  수주처로 시작하기
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
