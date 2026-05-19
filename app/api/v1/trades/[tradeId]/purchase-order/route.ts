import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';

type RouteContext = { params: Promise<{ tradeId: string }> };

async function forwardPurchaseOrder(
  request: Request,
  tradeId: string,
  method: 'POST' | 'PUT',
): Promise<Response> {
  const authorization = request.headers.get('authorization');

  let upstream: Response;
  try {
    const headers: HeadersInit = {
      ...(authorization ? { Authorization: authorization } : {}),
    };

    const init: RequestInit = { method, headers };

    if (method === 'PUT') {
      init.body = await request.formData();
    }

    upstream = await fetch(
      `${BACKEND_BASE_URL}/api/v1/trades/${tradeId}/purchase-order`,
      init,
    );
  } catch {
    return NextResponse.json(
      { message: 'Failed to reach backend server.' },
      { status: 502 },
    );
  }

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const bodyText = await upstream.text();
  const contentType = upstream.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const parsed = JSON.parse(bodyText) as unknown;
      return NextResponse.json(parsed, { status: upstream.status });
    } catch {
      return NextResponse.json(
        { message: bodyText || 'Invalid JSON response from backend.' },
        { status: upstream.status },
      );
    }
  }

  return new NextResponse(bodyText, {
    status: upstream.status,
    headers: {
      'content-type': contentType || 'text/plain; charset=utf-8',
    },
  });
}

/** PO 작성 시작(빈 row insert) */
export async function POST(request: Request, context: RouteContext) {
  const { tradeId } = await context.params;
  return forwardPurchaseOrder(request, tradeId, 'POST');
}

/** PO 작성·서명·발행 완료(발주처) */
export async function PUT(request: Request, context: RouteContext) {
  const { tradeId } = await context.params;
  return forwardPurchaseOrder(request, tradeId, 'PUT');
}
