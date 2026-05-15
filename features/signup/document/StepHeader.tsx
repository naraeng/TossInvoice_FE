import { Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SignupStep = 1 | 2 | 3;

const STEPS: { title: string; description: string }[] = [
  { title: '서류 등록·인증', description: 'OCR + 본인인증' },
  { title: '계정 정보', description: '이메일·비밀번호' },
  { title: '가입 완료', description: '환영합니다' },
];

export type StepHeaderProps = {
  currentStep?: SignupStep;
  /** 서류 상호 일치(OCR 목업 통과) 시에만 다음 버튼 활성 → `/signup/account` 로 이동 */
  canProceedToAccount?: boolean;
  className?: string;
};

export default function StepHeader({
  currentStep = 1,
  canProceedToAccount = false,
  className,
}: StepHeaderProps) {
  return (
    <header className={cn('w-full bg-white text-slate-900', className)}>
      <div className="flex flex-col gap-8 pb-2 md:gap-10">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[1.75rem] md:leading-snug">
              TossInvoice 시작하기
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-500 md:text-[15px]">
              사업자등록증·통장사본 업로드와 국세청 정보 확인을 한 번에 진행합니다.
            </p>
          </div>

          <div className="flex shrink-0 flex-row items-center gap-3 self-start sm:gap-4">
            {canProceedToAccount ? (
              <Button
                asChild
                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:px-5"
              >
                <Link href="/signup/account" title="계정 정보 입력 단계로 이동">
                  다음: 계정 정보
                  <ChevronRight className="ml-0.5 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                disabled
                title="사업자등록증과 통장사본 상호가 일치하면 활성화됩니다"
                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white opacity-50 shadow-sm sm:px-5"
              >
                다음: 계정 정보
                <ChevronRight className="ml-0.5 h-4 w-4" aria-hidden />
              </Button>
            )}
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
                        isActive || isComplete
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-500',
                      )}
                    >
                      {isComplete ? <Check className="h-4 w-4 stroke-[3]" aria-hidden /> : stepNumber}
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
    </header>
  );
}
