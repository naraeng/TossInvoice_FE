import { getAccessToken } from '@/lib/auth-storage';
import type { TradeApiRow } from '@/features/trade/types';

import { START_TRADE_PATH } from './build-start-trade-form-data';

export type TradesListApiResponse = {
  errorCode: string | null;
  message: string;
  result: TradeApiRow[] | null;
};

function resolveTradesListUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${START_TRADE_PATH}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${START_TRADE_PATH}`;
  return START_TRADE_PATH;
}

/** GET /api/v1/trades — 내 거래 목록 */
export async function fetchMyTrades(): Promise<TradeApiRow[]> {
  const token = getAccessToken();

  const res = await fetch(resolveTradesListUrl(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  let data: TradesListApiResponse;
  try {
    data = (await res.json()) as TradesListApiResponse;
  } catch {
    throw new Error('거래 목록을 불러오지 못했습니다.');
  }

  if (!res.ok) {
    throw new Error(data.message || '거래 목록을 불러오지 못했습니다.');
  }

  if (data.result != null) {
    return data.result;
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new Error(data.message || '거래 목록을 불러오지 못했습니다.');
  }

  return [];
}
