import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';

type RouteContext = { params: Promise<{ tradeId: string }> };

/** PI 거절(발주처) — POST /api/v1/trades/{tradeId}/reject */
export async function POST(request: Request, context: RouteContext) {
  const authorization = request.headers.get('authorization');
  const { tradeId } = await context.params;

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/trades/${tradeId}/reject`, {
      method: 'POST',
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });
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
