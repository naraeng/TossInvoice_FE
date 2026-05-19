export class IssuePurchaseOrderApiError extends Error {
  constructor(
    message: string,
    readonly errorCode: string | null,
  ) {
    super(message);
    this.name = 'IssuePurchaseOrderApiError';
  }
}

export class IssuePurchaseOrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IssuePurchaseOrderValidationError';
  }
}

export function getIssuePurchaseOrderErrorMessage(error: unknown): string {
  if (error instanceof IssuePurchaseOrderApiError) {
    return error.message;
  }
  if (error instanceof IssuePurchaseOrderValidationError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '발주서 발행에 실패했습니다.';
}
