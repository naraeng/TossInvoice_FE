import { apiClient } from '@/lib/api';

import { START_TRADE_PATH } from './build-start-trade-form-data';
import type { TradeDetailApiResponse, TradeDetailResult } from './trade-detail-types';

/**
 * GET /api/v1/trades/{tradeId} — 거래(PI) 상세
 *
 * raw `fetch()` 가 아닌 `apiClient`(axios) 를 사용해야 한다:
 * - 요청 인터셉터가 Authorization Bearer 헤더와 baseURL 을 자동으로 채워준다.
 * - 응답 인터셉터가 401 을 받으면 자동으로 /auth/reissue 로 토큰 갱신 후 1회 재시도하고,
 *   reissue 가 실패하면 토큰을 비우고 로그인 페이지로 보낸다(앱 전체와 동일한 인증 정책).
 */
export async function fetchTradeDetail(tradeId: number): Promise<TradeDetailResult> {
  let data: TradeDetailApiResponse;
  try {
    const res = await apiClient.get<TradeDetailApiResponse>(`${START_TRADE_PATH}/${tradeId}`);
    data = res.data;
  } catch (error: unknown) {
    // axios 에러에서 백엔드가 내려준 message 를 우선 노출
    if (typeof error === 'object' && error && 'response' in error) {
      const response = (error as { response?: { data?: TradeDetailApiResponse } }).response;
      const message = response?.data?.message;
      throw new Error(message || '거래 상세를 불러오지 못했습니다.');
    }
    throw new Error('거래 상세를 불러오지 못했습니다.');
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new Error(data.message || '거래 상세를 불러오지 못했습니다.');
  }

  if (!data.result) {
    throw new Error(data.message || '거래 상세를 불러오지 못했습니다.');
  }

  return data.result;
}
