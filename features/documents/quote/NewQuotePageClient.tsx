'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createDraftQuoteViaApi } from '@/lib/documents/create-draft-quote-client';
import { useAuthGuard } from '@/lib/auth-guard';

export function NewQuotePageClient() {
  const router = useRouter();
  const { ready } = useAuthGuard();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    void (async () => {
      try {
        const { quoteId } = await createDraftQuoteViaApi({ asSupplier: true });
        if (!cancelled) {
          router.replace(`/documents/quotes/${quoteId}`);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : '견적서 작성 화면으로 이동하지 못했습니다.',
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-sm text-rose-700">{error}</p>
        <Link href="/trade" className="mt-4 inline-block text-sm font-semibold text-blue-600">
          거래 관리로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
      견적서 작성 화면으로 이동하는 중…
    </div>
  );
}
