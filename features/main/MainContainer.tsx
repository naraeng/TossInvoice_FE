'use client';

import { Building2, Check, MailWarning } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MainContainer() {
  const [activeStep, setActiveStep] = useState(0);

  const quickActions = [
    {
      step: '1',
      title: '발주서 작성',
      description: '거래처 선택만으로 검증된 계좌·정보 자동 입력',
    },
    {
      step: '2',
      title: '은행 검증·안전결제 묶음',
      description: '거래 토큰 발행 · 결제 조건 보관 · 위변조 차단',
    },
    {
      step: '3',
      title: '조건 충족 시 이체 알람 전송',
      description: '선급/잔금 자동 분할 · OTP 인증 후 송금',
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % quickActions.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [quickActions.length]);

  return (
    <section
      id="service"
      className="rounded-3xl scroll-mt-20 border border-blue-100/70 bg-white/85 px-6 pb-8 pt-6 shadow-[0_16px_60px_-28px_rgba(37,99,235,0.45)] backdrop-blur-xl md:px-10 md:pb-10 md:pt-8"
    >
      <div className="grid gap-9 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div className="space-y-15 md:pl-6 md:pr-6">
          <h1 className="text-4xl mt-10 font-bold leading-tight tracking-tight text-slate-900">
            통장사본 없는 거래,
            <br />
            은행이 직접 보호합니다.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            사업자등록증, 통장사본을 매번 주고받지 않아도 됩니다.
            <br />
            발주부터 결제까지, 은행이 검증한 거래만 안전하게 이어집니다.
          </p>
          <div className="mb-7 flex flex-wrap gap-3">
            <button
              id="order-request"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              무료로 시작하기
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700">
              기능 둘러보기
            </button>
          </div>
          <p className="mb-3 mt-10 max-w-xl text-sm leading-7 text-slate-400">
            이미 5,200개의 기업이 사용중
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center shadow-sm">
              <MailWarning className="mb-1 h-7 w-7 text-red-500" strokeWidth={2.2} />
              <div className="text-lg font-bold text-red-500">4년간 1,330억</div>
              <div className="mt-3 text-xs text-slate-600">이메일 무역사기 피해액(관세청)</div>
            </div>
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center shadow-sm">
              <Building2 className="mb-1 h-7 w-7  text-red-500" strokeWidth={2.2} />
              <div className="text-lg font-bold text-red-500">5년간 442억</div>
              <div className="mt-3 text-xs text-slate-600">기업 간 거래 사기 피해(중앙일보)</div>
            </div>
          </div>
        </div>

        <div className="space-y-8 rounded-3xl border border-blue-100/80 bg-white p-10 shadow-[0_10px_36px_-18px_rgba(37,99,235,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold tracking-[0.06em] text-blue-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              LIVE 거래 흐름
            </div>
          </div>
          <h2 className="text-2xl pl-2 font-bold leading-tight tracking-tight text-slate-900">
            이렇게 안전하게 흘러갑니다
          </h2>
          <div className="relative grid gap-4">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[calc((100%-2rem)/3)] rounded-3xl border border-blue-500 bg-blue-100 shadow-[0_16px_32px_-20px_rgba(37,99,235,0.55)] ring-1 ring-blue-200 transition-transform duration-700 ease-in-out"
              style={{ transform: `translateY(calc(${activeStep} * (100% + 1rem)))` }}
            />
            {quickActions.map((action, index) => {
              const isActive = activeStep === index;

              return (
                <div key={action.title} className="relative z-10">
                  <div
                    className={`rounded-3xl border px-6 py-6 transition-colors duration-500 ease-in-out ${
                      isActive
                        ? 'border-transparent bg-transparent'
                        : 'border-slate-200 bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors duration-500 ease-in-out ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'
                        }`}
                      >
                        {isActive ? <Check className="h-5 w-5" strokeWidth={3} /> : action.step}
                      </div>
                      <div>
                        <h3
                          className={`text-base font-semibold transition-colors duration-500 ease-in-out ${
                            isActive ? 'text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          {action.title}
                        </h3>
                        <p
                          className={`mt-2 text-sm leading-6 transition-colors duration-500 ease-in-out ${
                            isActive ? 'text-slate-600' : 'text-slate-400'
                          }`}
                        >
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
