export class StartPurchaseOrderApiError extends Error {
  constructor(
    message: string,
    readonly errorCode: string | null,
  ) {
    super(message);
    this.name = 'StartPurchaseOrderApiError';
  }
}

export function getStartPurchaseOrderErrorMessage(error: unknown): string {
  if (error instanceof StartPurchaseOrderApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '발주서 작성을 시작하지 못했습니다.';
}
