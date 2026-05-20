/**
 * 백엔드 ErrorCode → 사용자 친화 한국어 메시지 매핑.
 *
 * 백엔드 enum 정의 위치(참고):
 * - AuthErrorCode (AUTH_001..003)
 * - UserErrorCode (USER_001)
 * - GlobalErrorCode (REQUEST_001..027, RESPONSE_001..)
 * - StorageErrorCode (STORAGE_001..003)
 * - TradeErrorCode (TRADE_001..015)
 * - ReportErrorCode (REPORT_001..003)
 *
 * 매핑되지 않은 코드는 백엔드가 함께 내려준 `message`(fallbackMessage)를 그대로 노출.
 * 코드도 메시지도 없으면 일반 안내문으로 대체.
 */

const ERROR_MESSAGES: Record<string, string> = {
  // ── Auth
  AUTH_001: '이미 사용 중인 이메일입니다.',
  AUTH_002: '이미 등록된 사업자번호입니다.',
  AUTH_003: '이메일 또는 비밀번호가 올바르지 않습니다.',

  // ── User
  USER_001: '해당 사업자번호로 등록된 회사를 찾을 수 없어요.',

  // ── Request (validation/auth/expired token 등)
  REQUEST_001: '요청 형식이 올바르지 않습니다. 입력값을 확인해 주세요.',
  REQUEST_002: '로그인이 필요합니다.',
  REQUEST_003: '세션이 유효하지 않습니다. 다시 로그인해 주세요.',
  REQUEST_004: '세션이 일치하지 않습니다. 다시 로그인해 주세요.',
  REQUEST_005: '로그인이 필요합니다.',
  REQUEST_006: '권한이 없는 요청입니다.',
  REQUEST_007: '요청한 리소스를 찾을 수 없습니다.',
  REQUEST_014: '세션이 만료되었습니다. 다시 로그인해 주세요.',
  REQUEST_024: '세션이 만료되었습니다. 다시 로그인해 주세요.',
  REQUEST_025: '세션이 만료되었습니다. 다시 로그인해 주세요.',
  REQUEST_026: '필수 첨부 파일이 누락되었습니다.',
  REQUEST_027: '업로드 가능한 파일 크기를 초과했습니다.',

  // ── Storage
  STORAGE_001: '업로드 파일이 비어 있습니다. 파일을 다시 선택해 주세요.',
  STORAGE_002: '지원하지 않는 파일 형식입니다. 사업자등록증은 PDF, 통장사본은 JPG/PNG만 업로드할 수 있어요.',
  STORAGE_003: '파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.',

  // ── Trade
  TRADE_001: '거래를 찾을 수 없습니다.',
  TRADE_002: '발주처를 찾을 수 없습니다.',
  TRADE_003: '자기 자신과는 거래를 시작할 수 없습니다.',
  TRADE_004: '현재 거래 상태에서는 수행할 수 없는 동작입니다.',
  TRADE_005: '해당 거래에 참여한 사용자가 아닙니다.',
  TRADE_006: '수주처만 수행할 수 있는 동작입니다.',
  TRADE_007: '발주처만 수행할 수 있는 동작입니다.',
  TRADE_008: '거래 품목을 1개 이상 추가해 주세요.',
  TRADE_009: '견적서 유효기간은 현재 시각 이후여야 합니다.',
  TRADE_010: '이미 발주서 작성이 시작되어 견적을 거절할 수 없습니다.',
  TRADE_011: '발주서 작성이 아직 시작되지 않았습니다.',
  TRADE_012: '견적서가 존재하지 않습니다.',
  TRADE_013: '발주서가 존재하지 않습니다.',
  TRADE_014: '인보이스가 존재하지 않습니다.',
  TRADE_015: '서명 이미지가 필요합니다.',

  // ── Report
  REPORT_001: '이미 신고된 거래입니다.',
  REPORT_002: '해당 거래의 당사자만 신고할 수 있습니다.',
  REPORT_003: '신고 대상이 해당 거래의 상대방이 아닙니다.',

  // ── Response/server
  RESPONSE_001: '서버와의 연결에 실패했어요. 잠시 후 다시 시도해 주세요.',
};

/**
 * 우선순위:
 *   1) 등록된 errorCode → 매핑된 한국어 메시지
 *   2) 미등록 errorCode → 백엔드가 동봉한 fallbackMessage
 *   3) fallbackMessage 도 없으면 → 일반 안내문
 */
export function resolveErrorMessage(
  errorCode: string | null | undefined,
  fallbackMessage?: string | null,
): string {
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }
  if (fallbackMessage && fallbackMessage.trim()) {
    return fallbackMessage;
  }
  return '요청 처리 중 오류가 발생했습니다.';
}

/** axios 에러 객체 또는 임의의 에러에서 errorCode / message 를 안전하게 추출 */
export function resolveErrorMessageFromError(
  error: unknown,
  defaultMessage = '요청 처리 중 오류가 발생했습니다.',
): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (
      error as { response?: { data?: { errorCode?: string; message?: string } } }
    ).response;
    const code = response?.data?.errorCode ?? null;
    const message = response?.data?.message ?? null;
    if (code || message) return resolveErrorMessage(code, message);
  }
  if (error instanceof Error && error.message) return error.message;
  return defaultMessage;
}
