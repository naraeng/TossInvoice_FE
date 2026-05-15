import { Search, Bell } from 'lucide-react';
import Link from 'next/link';

export default function SignupHeader() {
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
            </nav>
    
            <Link
            href="/login"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            이미 계정이 있나요? 로그인하러 가기 →
          </Link>
          </div>
        </header>
    );
}