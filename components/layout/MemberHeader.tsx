import { Search, Bell } from 'lucide-react';

export default function MemberHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-6 py-3 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
            TI
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">Toss Invoice</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-500 md:flex">
          <a className="text-blue-600" href="#">
            홈
          </a>
          <a className="transition hover:text-slate-900" href="#">
            거래
          </a>
          <a className="transition hover:text-slate-900" href="#">
            거래처
          </a>
          <a className="transition hover:text-slate-900" href="#">
            결제
          </a>
          <a className="transition hover:text-slate-900" href="#">
            리포트
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
            <Search className="h-4 w-4" />
            <span>거래처 · PO번호 검색</span>
          </div>

          <div className="relative">
            <Bell className="h-5 w-5 text-slate-500" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              민
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-900">날애커피</p>
              <p className="text-xs text-slate-400">날애대표</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
