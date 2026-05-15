'use client';

/**
 * 계정 가입 단계 상단: 단계 제목·설명·스텝퍼·이전/가입완료 버튼.
 * (공통 상단 `SignupHeader`는 `app/signup/layout.tsx`에서만 사용)
 */

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { SignupStep } from '@/features/signup/document/StepHeader';

const STEPS: { title: string; description: string }[] = [
  { title: '서류 등록·인증', description: 'OCR + 본인인증' },
  { title: '계정 정보', description: '이메일·비밀번호' },
  { title: '가입 완료', description: '환영합니다' },
];

export type SignupIntroProps = {
  className?: string;
};

export default function SignupIntro({ className }: SignupIntroProps) {
  const currentStep: SignupStep = 2;

  return (
    <section
      className={cn('w-full bg-white text-slate-900', className)}
      aria-label="회원가입 계정 단계 안내"
    >
      <div className="flex flex-col gap-8 pb-2 md:gap-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs font-semibold text-slate-500">회원가입</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[1.75rem] md:leading-snug">
              계정 정보 입력
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-500 md:text-[15px]">
              로그인에 사용할 이메일·비밀번호를 입력하고 필수 약관에 동의해 주세요.
            </p>
          </div>

          <div className="flex shrink-0 flex-row flex-wrap items-center gap-2 self-start sm:gap-3">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:px-5"
            >
              <Link href="/signup">
                <ChevronLeft className="mr-0.5 h-4 w-4" aria-hidden />
                이전
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:px-5"
            >
              <Link href="/signup/complete">
                가입 완료하기
                <ChevronRight className="ml-0.5 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <div className="w-full">
          <div className="flex w-full min-w-0">
            {STEPS.map((step, index) => {
              const stepNumber = (index + 1) as SignupStep;
              const isActive = stepNumber === currentStep;
              const isComplete = stepNumber < currentStep;

              return (
                <div key={step.title} className="flex min-w-0 flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    <div
                      className={cn(
                        'h-px min-w-0 flex-1',
                        index === 0 ? 'bg-transparent' : 'bg-slate-200',
                      )}
                    />
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                        isComplete && 'bg-emerald-500 text-white',
                        isActive && 'bg-blue-600 text-white',
                        !isActive && !isComplete && 'bg-slate-200 text-slate-500',
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4 stroke-[3]" aria-hidden />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <div
                      className={cn(
                        'h-px min-w-0 flex-1',
                        index === STEPS.length - 1 ? 'bg-transparent' : 'bg-slate-200',
                      )}
                    />
                  </div>
                  <div className="mt-3 w-full px-1 text-center">
                    <p
                      className={cn(
                        'text-sm font-bold leading-tight',
                        isActive || isComplete ? 'text-slate-900' : 'text-slate-500',
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">{step.description}</p>
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
