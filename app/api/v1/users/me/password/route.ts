import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';

export async function PATCH(request: Request) {
  const authorization = request.headers.get('authorization');

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/users/me/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ message: 'Failed to reach backend server.' }, { status: 502 });
  }

  if (upstream.status === 204) return new NextResponse(null, { status: 204 });

  const bodyText = await upstream.text();
  const contentType = upstream.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  if (isJson) {
    try {
      return NextResponse.json(JSON.parse(bodyText) as unknown, { status: upstream.status });
    } catch {
      return NextResponse.json(
        { message: bodyText || 'Invalid JSON response from backend.' },
        { status: upstream.status },
      );
    }
  }

  return new NextResponse(bodyText, {
    status: upstream.status,
    headers: { 'content-type': contentType || 'text/plain; charset=utf-8' },
  });
}
