'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { QuoteDetailContainer } from '@/features/documents/quote/QuoteDetailContainer';
import { useAuthGuard } from '@/lib/auth-guard';
import { getViewerRole, parseViewerRoleParam } from '@/lib/documents/get-viewer-role';
import { getQuoteById } from '@/lib/documents/quote-store';
import { resolveCurrentCompanyClient } from '@/lib/documents/resolve-current-company-client';
import { fetchTradeDetail } from '@/lib/trades/fetch-trade-detail';
import { mapTradeDetailToQuote } from '@/lib/trades/map-trade-to-quote';
import type { QuoteDocument, UserRole } from '@/types/documents/document';

type Props = {
  quoteId: string;
};

function parseTradeId(quoteId: string): number | null {
  const m = quoteId.match(/^trade-(\d+)$/);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) ? id : null;
}

export function QuoteDetailPageClient({ quoteId }: Props) {
  const { ready } = useAuthGuard();
  const searchParams = useSearchParams();
  const [quote, setQuote] = useState<QuoteDocument | null>(null);
  const [viewerRole, setViewerRole] = useState<UserRole | null>(null);
  const [denied, setDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    void (async () => {
      const fromUrl = parseViewerRoleParam(searchParams.get('viewer'));

      // 1) viewer / company 결정
      let role: UserRole | null = fromUrl;
      let companyId: string | null = null;
      let userId: number | undefined;
      let businessNumber: string | undefined;
      let companyName: string | undefined;

      try {
        const company = await resolveCurrentCompanyClient();
        companyId = company.companyId;
        userId = company.userId;
        businessNumber = company.businessNumber;
        companyName = company.companyName;
        if (!role) {
          // /users/me 응답 기반 기본 역할 — quote 매칭 전 fallback
          role = company.role;
        }
      } catch {
        if (!cancelled && !role) {
          setDenied(true);
          return;
        }
      }

      // 2) quote 빌드: trade-{tradeId} 우선, 레거시 quote-{ts}는 in-memory 캐시
      const tradeId = parseTradeId(quoteId);
      let nextQuote: QuoteDocument | undefined;

      if (tradeId != null) {
        try {
          const detail = await fetchTradeDetail(tradeId);
          // perspectiveRole은 detail의 seller/buyer userId와 me.userId 비교로 정확히 결정.
          // (resolveCurrentCompanyClient.role은 항상 SUPPLIER로 떨어지는 한계가 있어
          //  알림 등으로 진입한 발주처 사용자가 수주처 시각으로 매핑되던 회귀를 차단.)
          let perspectiveRole: 'SELLER' | 'BUYER';
          let resolvedViewerHint: UserRole | undefined;
          if (userId != null && detail.seller?.userId === userId) {
            perspectiveRole = 'SELLER';
            resolvedViewerHint = 'SUPPLIER';
          } else if (userId != null && detail.buyer?.userId === userId) {
            perspectiveRole = 'BUYER';
            resolvedViewerHint = 'CLIENT';
          } else {
            // userId 매칭 실패 시 fromUrl 또는 role fallback
            perspectiveRole = role === 'CLIENT' ? 'BUYER' : 'SELLER';
            resolvedViewerHint = role ?? undefined;
          }
          nextQuote = {
            ...mapTradeDetailToQuote(detail, { perspectiveRole }),
            viewerRoleHint: resolvedViewerHint,
          };
        } catch {
          if (!cancelled) {
            setNotFound(true);
            return;
          }
        }
      } else {
        nextQuote = getQuoteById(quoteId);
        if (!nextQuote) {
          if (!cancelled) setNotFound(true);
          return;
        }
      }

      if (!nextQuote || cancelled) return;

      // 3) viewerRole 확정 (quote가 있으면 회사 매칭으로 우선)
      let resolvedRole: UserRole | null = nextQuote.viewerRoleHint ?? fromUrl;
      if (!resolvedRole) {
        if (companyId) {
          try {
            resolvedRole = getViewerRole(companyId, nextQuote, {
              userId,
              businessNumber,
              companyName,
            });
          } catch {
            if (!cancelled) setDenied(true);
            return;
          }
        } else {
          resolvedRole = role;
        }
      }

      if (!resolvedRole) {
        if (!cancelled) setDenied(true);
        return;
      }

      if (!cancelled) {
        setQuote(nextQuote);
        setViewerRole(resolvedRole);
        setDenied(false);
        setNotFound(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, quoteId, searchParams]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
        로그인 상태를 확인하는 중…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">문서를 찾을 수 없습니다.</p>
        <Link href="/trade" className="mt-4 inline-block font-semibold text-blue-600">
          거래 목록으로
        </Link>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">이 문서에 접근할 권한이 없습니다.</p>
        <Link href="/dashboard" className="mt-4 inline-block font-semibold text-blue-600">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  if (!quote || !viewerRole) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
        문서 정보를 불러오는 중…
      </div>
    );
  }

  return <QuoteDetailContainer quote={quote} viewerRole={viewerRole} />;
}
