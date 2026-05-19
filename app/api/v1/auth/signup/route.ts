import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';

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
    upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/signup`, {
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

  // Preserve upstream response payload/messages as-is.
  // Only sanitize auth challenge header to prevent browser basic-auth popup.
  if (isJson) {
    try {
      const parsed = JSON.parse(bodyText) as unknown;
      const response = NextResponse.json(parsed, { status: upstream.status });
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
