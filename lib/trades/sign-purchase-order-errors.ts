export class SignPurchaseOrderApiError extends Error {
  constructor(
    message: string,
    readonly errorCode: string | null,
  ) {
    super(message);
    this.name = 'SignPurchaseOrderApiError';
  }
}

export class SignPurchaseOrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignPurchaseOrderValidationError';
  }
}

export function getSignPurchaseOrderErrorMessage(error: unknown): string {
  if (error instanceof SignPurchaseOrderApiError) {
    return error.message;
  }
  if (error instanceof SignPurchaseOrderValidationError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '발주서 서명에 실패했습니다.';
}
