import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';
const REFRESH_COOKIE_NAME = 'ti-refresh-token';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      {
        errorCode: 'REQUEST_024',
        message: '리프레시 토큰이 만료되었거나 존재하지 않습니다.',
        result: null,
      },
      { status: 401 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/reissue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
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
      const newRefreshToken = parsed?.result?.refreshToken;
      if (newRefreshToken && parsed?.result) {
        delete parsed.result.refreshToken;
      }
      const response = NextResponse.json(parsed, { status: upstream.status });
      if (newRefreshToken) {
        response.cookies.set({
          name: REFRESH_COOKIE_NAME,
          value: newRefreshToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: COOKIE_MAX_AGE_SECONDS,
        });
      } else if (upstream.status >= 400) {
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
