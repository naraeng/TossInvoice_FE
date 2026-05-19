export class SignInvoiceApiError extends Error {
  constructor(
    message: string,
    readonly errorCode: string | null,
  ) {
    super(message);
    this.name = 'SignInvoiceApiError';
  }
}

export class SignInvoiceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignInvoiceValidationError';
  }
}

export function getSignInvoiceErrorMessage(error: unknown): string {
  if (error instanceof SignInvoiceApiError) {
    return error.message;
  }
  if (error instanceof SignInvoiceValidationError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '최종 서명에 실패했습니다.';
}
