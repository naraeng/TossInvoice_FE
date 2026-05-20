import { Suspense } from 'react';

import { QuoteDetailPageClient } from '@/features/documents/quote/QuoteDetailPageClient';

type PageProps = {
  params: Promise<{ quoteId: string }>;
};

/**
 * 서버는 더 이상 globalThis quote-store를 조회하지 않음.
 * 실데이터는 클라이언트에서 `trade-{tradeId}` 패턴 파싱 후 백엔드 detail로 빌드.
 * 레거시 `quote-{ts}` URL은 클라이언트 in-memory 캐시에서만 시도.
 */
export default async function QuoteDetailPage({ params }: PageProps) {
  const { quoteId } = await params;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
          문서 정보를 불러오는 중…
        </div>
      }
    >
      <QuoteDetailPageClient quoteId={quoteId} />
    </Suspense>
  );
}
