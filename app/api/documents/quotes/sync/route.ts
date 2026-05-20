import { NextResponse } from 'next/server';

import type { QuoteDocument } from '@/types/documents/document';

/**
 * 견적 sync 라우트.
 *
 * 과거에는 Next 서버의 모듈 인메모리 quote-store 에 quote 를 저장해
 * 다음 페이지 진입(SSR)에서 같은 quote 를 읽도록 했으나, 멀티 인스턴스
 * /콜드 스타트 환경에서는 신뢰할 수 없어 server-side persist 를 제거했다.
 *
 * 현재 클라이언트 컨테이너는 상세 진입마다 `fetchTradeDetail` → `mapTradeDetailToQuote`
 * 로 quote 를 재구성하므로 이 라우트는 더 이상 상태를 보존할 필요가 없다.
 * 호출처(5곳)의 await 흐름과 에러 핸들링 호환을 위해 200 응답만 돌려준다.
 */
export async function POST(request: Request) {
  let body: { quote?: QuoteDocument };
  try {
    body = (await request.json()) as { quote?: QuoteDocument };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const quote = body.quote;
  if (!quote?.id || !quote.supplier || !quote.client || !quote.items) {
    return NextResponse.json({ ok: false, error: '견적 데이터가 올바르지 않습니다.' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    quoteId: quote.id,
  });
}
