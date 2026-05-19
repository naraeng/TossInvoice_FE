import { syncQuoteViaApi } from '@/lib/documents/sync-quote-client';
import type { UserRole } from '@/types/documents/document';
import type { TradeApiRow, TradeRole } from '@/features/trade/types';

import { fetchTradeDetail } from './fetch-trade-detail';
import { mapTradeDetailToQuote } from './map-trade-to-quote';

function tradeRoleToViewerRole(tradeRole: TradeRole): UserRole {
  return tradeRole === 'SELLER' ? 'SUPPLIER' : 'CLIENT';
}

/**
 * 「거래보기」— GET /api/v1/trades/{tradeId} 단건 조회 후 견적 화면으로 이동
 * @param perspectiveRole 현재 탭 역할 (수주중=SELLER, 발주중=BUYER)
 */
export async function openTradeQuote(
  trade: TradeApiRow,
  perspectiveRole: TradeRole,
): Promise<string> {
  const detail = await fetchTradeDetail(trade.tradeId);
  const quote = {
    ...mapTradeDetailToQuote(detail, { perspectiveRole }),
    viewerRoleHint: tradeRoleToViewerRole(perspectiveRole),
  };
  await syncQuoteViaApi(quote);
  return quote.id;
}

export { tradeRoleToViewerRole };
