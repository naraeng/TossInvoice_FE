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

export async function PATCH(request: Request) {
  const authorization = request.headers.get('authorization');
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      {
        errorCode: 'REQUEST_001',
        message: 'multipart/form-data(data + bankbook)로 요청해 주세요.',
        result: null,
      },
      { status: 400 },
    );
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ message: 'Invalid multipart request body.' }, { status: 400 });
  }

  const dataPart = incoming.get('data');
  const bankbook = incoming.get('bankbook');
  if (!dataPart) {
    return NextResponse.json(
      {
        errorCode: 'REQUEST_001',
        message: 'data 파트(bank, account JSON)가 필요합니다.',
        result: null,
      },
      { status: 400 },
    );
  }
  if (!bankbook) {
    return NextResponse.json(
      {
        errorCode: 'STORAGE_001',
        message: '업로드 파일이 비어있습니다.',
        result: null,
      },
      { status: 400 },
    );
  }

  const outbound = new FormData();
  appendPart(outbound, 'data', dataPart);
  appendPart(outbound, 'bankbook', bankbook);

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/users/me/account`, {
      method: 'PATCH',
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: outbound,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ message: 'Failed to reach backend server.' }, { status: 502 });
  }

  if (upstream.status === 204) return new NextResponse(null, { status: 204 });

  const bodyText = await upstream.text();
  const upstreamContentType = upstream.headers.get('content-type') ?? '';
  const isJson = upstreamContentType.includes('application/json');
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
    headers: { 'content-type': upstreamContentType || 'text/plain; charset=utf-8' },
  });
}
