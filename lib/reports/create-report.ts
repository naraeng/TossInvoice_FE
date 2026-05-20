import { apiClient } from '@/lib/api';

/**
 * POST /api/v1/report — 거래 상대방을 신고.
 *
 * 백엔드 CreateReportRequest 스펙:
 *   { tradeId: Long(필수), reportedId: Long(필수) }
 *
 * - reporterId 는 백엔드가 @UserId(JWT)에서 직접 추출하므로 본문에 포함하지 않는다.
 * - 성공 시 201 Created. 본문은 없음.
 */
export type CreateReportPayload = {
  tradeId: number;
  reportedId: number;
};

export async function createReport(payload: CreateReportPayload): Promise<void> {
  try {
    await apiClient.post('/api/v1/report', {
      tradeId: payload.tradeId,
      reportedId: payload.reportedId,
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'response' in error) {
      const response = (
        error as { response?: { data?: { message?: string } } }
      ).response;
      const message = response?.data?.message;
      throw new Error(message || '신고 접수에 실패했습니다.');
    }
    throw new Error('네트워크 오류로 신고를 접수하지 못했습니다.');
  }
}
