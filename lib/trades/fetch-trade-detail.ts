import { getAccessToken } from '@/lib/auth-storage';

import { START_TRADE_PATH } from './build-start-trade-form-data';
import type { TradeDetailApiResponse, TradeDetailResult } from './trade-detail-types';

function resolveTradeDetailUrl(tradeId: number): string {
  const path = `${START_TRADE_PATH}/${tradeId}`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

/** GET /api/v1/trades/{tradeId} — 거래(PI) 상세 */
export async function fetchTradeDetail(tradeId: number): Promise<TradeDetailResult> {
  const token = getAccessToken();

  const res = await fetch(resolveTradeDetailUrl(tradeId), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  let data: TradeDetailApiResponse;
  try {
    data = (await res.json()) as TradeDetailApiResponse;
  } catch {
    throw new Error('거래 상세를 불러오지 못했습니다.');
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new Error(data.message || '거래 상세를 불러오지 못했습니다.');
  }

  if (!res.ok || !data.result) {
    throw new Error(data.message || '거래 상세를 불러오지 못했습니다.');
  }

  return data.result;
}
