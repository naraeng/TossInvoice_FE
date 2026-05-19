import Link from 'next/link';

import BrandLogo from '@/components/layout/BrandLogo';
import HeaderShell from '@/components/layout/HeaderShell';

export default function SignupHeader() {
  return (
    <HeaderShell contentClassName="px-10 lg:px-14">
      <BrandLogo href="/" />

      <Link
        href="/login"
        className="ml-auto pl-2 text-right text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
      >
        이미 계정이 있나요? 로그인하러 가기 →
      </Link>
    </HeaderShell>
  );
}
