import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';

function appendPart(form: FormData, key: string, value: FormDataEntryValue | null) {
  if (value == null) return;
  if (value instanceof Blob) {
    const filename =
      'name' in value && typeof (value as File).name === 'string'
        ? (value as File).name
        : key === 'data'
          ? 'data.json'
          : 'upload';
    form.append(key, value, filename);
    return;
  }
  form.append(key, String(value));
}

export async function POST(request: Request) {
  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json(
      { message: 'Invalid multipart request body.' },
      { status: 400 },
    );
  }

  const outbound = new FormData();
  appendPart(outbound, 'data', incoming.get('data'));
  appendPart(outbound, 'businessRegistration', incoming.get('businessRegistration'));
  appendPart(outbound, 'bankbook', incoming.get('bankbook'));

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/auth/signup`, {
      method: 'POST',
      body: outbound,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: 'Failed to reach backend server.' },
      { status: 502 },
    );
  }

  const bodyText = await upstream.text();
  const upstreamContentType = upstream.headers.get('content-type') ?? '';
  const isJson = upstreamContentType.includes('application/json');

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
      'content-type': upstreamContentType || 'text/plain; charset=utf-8',
    },
  });
  response.headers.delete('www-authenticate');
  return response;
}
