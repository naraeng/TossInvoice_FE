import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';
const REFRESH_COOKIE_NAME = 'ti-refresh-token';

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: 'Failed to reach backend server.' },
      { status: 502 },
    );
  }

  if (upstream.status === 204) {
    const response = new NextResponse(null, { status: 204 });
    response.cookies.delete(REFRESH_COOKIE_NAME);
    return response;
  }

  const bodyText = await upstream.text();
  const contentType = upstream.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const parsed = JSON.parse(bodyText) as unknown;
      const response = NextResponse.json(parsed, { status: upstream.status });
      if (upstream.status === 401) {
        response.cookies.delete(REFRESH_COOKIE_NAME);
      }
      return response;
    } catch {
      const response = NextResponse.json(
        { message: bodyText || 'Invalid JSON response from backend.' },
        { status: upstream.status },
      );
      if (upstream.status === 401) {
        response.cookies.delete(REFRESH_COOKIE_NAME);
      }
      return response;
    }
  }

  const response = new NextResponse(bodyText, {
    status: upstream.status,
    headers: {
      'content-type': contentType || 'text/plain; charset=utf-8',
    },
  });
  if (upstream.status === 401) {
    response.cookies.delete(REFRESH_COOKIE_NAME);
  }
  return response;
}
