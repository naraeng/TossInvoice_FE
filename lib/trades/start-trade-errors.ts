export class StartTradeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StartTradeValidationError';
  }
}

export class StartTradeApiError extends Error {
  readonly errorCode: string | null;

  constructor(message: string, errorCode: string | null = null) {
    super(message);
    this.name = 'StartTradeApiError';
    this.errorCode = errorCode;
  }
}

type ErrorResponseBody = {
  message?: string;
  error?: string;
  status?: number;
};

export function getStartTradeErrorMessage(error: unknown): string {
  if (error instanceof StartTradeValidationError || error instanceof StartTradeApiError) {
    return error.message;
  }

  if (typeof error === 'object' && error && 'response' in error) {
    const data = (error as { response?: { data?: ErrorResponseBody; status?: number } })
      .response?.data;
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (data?.error === 'Bad Request' || data?.status === 400) {
      return '요청 형식이 올바르지 않습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.';
    }
  }

  return '견적서 발행에 실패했습니다.';
}
