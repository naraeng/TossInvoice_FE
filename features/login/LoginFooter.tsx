import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function LoginFooter() {
  return (
    <footer className="mx-auto max-w-lg px-6 pb-12 pt-10 text-center md:px-8">
      <p className="flex items-start justify-center gap-2 text-xs leading-relaxed text-slate-500">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <span>TossInvoice의 모든 거래는 안전결제로 보호됩니다</span>
      </p>
      <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
        © 2026 TossInvoice · 사업자등록번호 000-00-00000 · 통신판매업 신고 제0000-서울강남-0000호
      </p>
      <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
        <Link href="#" className="transition hover:text-slate-800">
          서비스 약관
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href="#" className="transition hover:text-slate-800">
          개인정보 처리방침
        </Link>
        <span className="text-slate-300" aria-hidden>
          ·
        </span>
        <Link href="#" className="transition hover:text-slate-800">
          고객센터
        </Link>
      </nav>
    </footer>
  );
}
