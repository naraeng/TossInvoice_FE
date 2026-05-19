export class RejectPurchaseOrderApiError extends Error {
  constructor(
    message: string,
    readonly errorCode: string | null,
  ) {
    super(message);
    this.name = 'RejectPurchaseOrderApiError';
  }
}

export function getRejectPurchaseOrderErrorMessage(error: unknown): string {
  if (error instanceof RejectPurchaseOrderApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '발주서 반려에 실패했습니다.';
}
