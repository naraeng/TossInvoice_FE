export class IssueInvoiceApiError extends Error {
  constructor(
    message: string,
    readonly errorCode: string | null,
  ) {
    super(message);
    this.name = 'IssueInvoiceApiError';
  }
}

export class IssueInvoiceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IssueInvoiceValidationError';
  }
}

export function getIssueInvoiceErrorMessage(error: unknown): string {
  if (error instanceof IssueInvoiceApiError) {
    return error.message;
  }
  if (error instanceof IssueInvoiceValidationError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return '인보이스 발행에 실패했습니다.';
}
