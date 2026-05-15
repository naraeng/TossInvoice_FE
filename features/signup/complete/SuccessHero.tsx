import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export type SuccessHeroProps = {
  className?: string;
};

export default function SuccessHero({ className }: SuccessHeroProps) {
  return (
    <div className={cn('flex flex-col items-center text-center mt-10', className)}>
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/35 ring-8 ring-emerald-100"
        aria-hidden
      >
        <Check className="h-10 w-10 stroke-[2.5]" />
      </div>
      <h1 className="mt-8 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        Toss Invoice 가입이 완료되었습니다 🎉
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 md:text-base">
        이제 안전한 B2B 거래를 시작할 수 있어요
      </p>
    </div>
  );
}
