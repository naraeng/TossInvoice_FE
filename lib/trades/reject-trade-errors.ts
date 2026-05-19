export class RejectTradeApiError extends Error {
  constructor(
    message: string,
    readonly errorCode: string | null,
  ) {
    super(message);
    this.name = 'RejectTradeApiError';
  }
}

export function getRejectTradeErrorMessage(error: unknown): string {
  if (error instanceof RejectTradeApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '견적서 거절에 실패했습니다.';
}
