import InfoSummaryCard from '@/features/signup/complete/InfoSummaryCard';
import SuccessHero from '@/features/signup/complete/SuccessHero';
import type { SignupStep } from '@/features/signup/document/StepHeader';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STEPS: { title: string; description: string }[] = [
  { title: '서류 등록·인증', description: 'OCR + 본인인증' },
  { title: '계정 정보', description: '이메일·비밀번호' },
  { title: '가입 완료', description: '환영합니다' },
];

function SignupCompleteStepper() {
  const currentStep: SignupStep = 3;

  return (
    <section className="w-full pt-10 pb-10" aria-label="회원가입 진행 단계">
      <div className="flex w-full min-w-0">
        {STEPS.map((step, index) => {
          const stepNumber = (index + 1) as SignupStep;
          const isActive = stepNumber === currentStep;
          const isDone = stepNumber <= currentStep;

          return (
            <div key={step.title} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    'h-px min-w-0 flex-1',
                    index === 0 ? 'bg-transparent' : isDone ? 'bg-blue-400' : 'bg-slate-200',
                  )}
                />
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    isDone ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500',
                  )}
                >
                  {isActive ? (
                    stepNumber
                  ) : isDone ? (
                    <Check className="h-4 w-4 stroke-[3]" aria-hidden />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div
                  className={cn(
                    'h-px min-w-0 flex-1',
                    index === STEPS.length - 1 ? 'bg-transparent' : isDone ? 'bg-blue-400' : 'bg-slate-200',
                  )}
                />
              </div>
              <div className="mt-3 w-full px-1 text-center">
                <p
                  className={cn(
                    'text-sm font-bold leading-tight',
                    isDone ? 'text-slate-900' : 'text-slate-500',
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
    </section>
  );
}

export default function SignupCompletePage() {
  return (
    <div className="min-h-[60vh] bg-slate-50 pb-16 pt-6 md:pt-8">
      <div className="mx-auto w-full max-w-screen-xl px-6 md:px-10">
        <SignupCompleteStepper />

        <SuccessHero className="mt-2" />
        <InfoSummaryCard className="mx-auto mt-10 max-w-3xl" />
      </div>
    </div>
  );
}
