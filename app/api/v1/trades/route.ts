import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');

  const { searchParams } = new URL(request.url);
  const upstreamUrl = new URL(`${BACKEND_BASE_URL}/api/v1/trades`);
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  if (page !== null) upstreamUrl.searchParams.set('page', page);
  if (size !== null) upstreamUrl.searchParams.set('size', size);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl.toString(), {
      method: 'GET',
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
