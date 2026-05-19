import { ChevronRight } from 'lucide-react';

type Props = {
  lastSavedLabel?: string;
};

export function QuoteDraftHeader({ lastSavedLabel = '방금' }: Props) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <nav className="flex items-center gap-1 text-xs font-medium text-slate-500">
          <span>거래</span>
          <ChevronRight className="size-3.5" />
          <span className="text-slate-700">새 견적서</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          견적서 작성
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
          발주처를 사업자번호로 검색·선택한 뒤 견적서 본문을 작성하고 즉시 서명해 발행하세요
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        자동 저장됨 · {lastSavedLabel}
      </div>
    </header>
  );
}
