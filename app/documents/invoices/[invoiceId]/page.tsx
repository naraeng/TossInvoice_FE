import Link from 'next/link';

export default function InvoiceDetailPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <p className="text-slate-600">Invoice 발행 화면은 다음 단계에서 연결됩니다.</p>
      <Link href="/dashboard" className="mt-4 inline-block font-semibold text-blue-600">
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
