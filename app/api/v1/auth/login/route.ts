import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';
const REFRESH_COOKIE_NAME = 'ti-refresh-token';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: 'Failed to reach backend server.' },
      { status: 502 },
    );
  }

  const bodyText = await upstream.text();
  const contentType = upstream.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const parsed = JSON.parse(bodyText) as {
        result?: { accessToken?: string; refreshToken?: string };
      };
      const refreshToken = parsed?.result?.refreshToken;
      if (refreshToken && parsed?.result) {
        delete parsed.result.refreshToken;
      }
      const response = NextResponse.json(parsed, { status: upstream.status });
      if (refreshToken) {
        response.cookies.set({
          name: REFRESH_COOKIE_NAME,
          value: refreshToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: COOKIE_MAX_AGE_SECONDS,
        });
      } else {
        response.cookies.delete(REFRESH_COOKIE_NAME);
      }
      response.headers.delete('www-authenticate');
      return response;
    } catch {
      const response = NextResponse.json(
        { message: bodyText || 'Invalid JSON response from backend.' },
        { status: upstream.status },
      );
      response.headers.delete('www-authenticate');
      return response;
    }
  }

  const response = new NextResponse(bodyText, {
    status: upstream.status,
    headers: {
      'content-type': contentType || 'text/plain; charset=utf-8',
    },
  });
  response.headers.delete('www-authenticate');
  return response;
}
