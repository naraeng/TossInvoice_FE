export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-blue-100/70 bg-white/65 backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-52 left-1/2 h-152 w-152 -translate-x-1/2 rounded-full bg-blue-500/25 blur-[140px]" />
      <div className="pointer-events-none absolute -left-20 top-152 h-80 w-80 rounded-full bg-sky-400/20 blur-[120px]" />

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
            TI
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">Toss Invoice</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a className="transition hover:text-blue-600" href="/#service">
            서비스 소개
          </a>
          <a className="transition hover:text-blue-600" href="/#reason">
            왜 필요한가요?
          </a>
          <a className="transition hover:text-blue-600" href="/#compare">
            기존 방식과 비교
          </a>
          <a className="transition hover:text-blue-600" href="/#process">
            이용 방법
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
            회원가입
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
