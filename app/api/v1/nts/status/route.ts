import { NextResponse } from 'next/server';

const NTS_BASE_URL = 'https://api.odcloud.kr/api/nts-businessman/v1/status';
const NTS_SERVICE_KEY = process.env.NTS_ODCLOUD_SERVICE_KEY?.trim() || '';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export async function POST(request: Request) {
  let payload: { businessNumber?: string };
  try {
    payload = (await request.json()) as { businessNumber?: string };
  } catch {
    return NextResponse.json(
      { message: '요청 형식이 올바르지 않습니다.' },
      { status: 400 },
    );
  }

  const businessNumber = digitsOnly(payload.businessNumber ?? '');
  if (businessNumber.length !== 10) {
    return NextResponse.json(
      { message: '사업자등록번호는 숫자 10자리여야 합니다.' },
      { status: 400 },
    );
  }

  if (!NTS_SERVICE_KEY) {
    return NextResponse.json(
      { message: 'NTS_ODCLOUD_SERVICE_KEY가 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  const url = `${NTS_BASE_URL}?serviceKey=${encodeURIComponent(NTS_SERVICE_KEY)}&returnType=JSON`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ b_no: [businessNumber] }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: '국세청 상태조회 API 호출에 실패했습니다.' },
      { status: 502 },
    );
  }

  const bodyText = await upstream.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { message: '국세청 상태조회 응답 파싱에 실패했습니다.' },
      { status: 502 },
    );
  }

  const statusData = (parsed as { data?: Array<Record<string, unknown>> })?.data?.[0];
  const businessStatusCode = String(statusData?.b_stt_cd ?? '');
  const businessStatus = String(statusData?.b_stt ?? '');
  const taxType = String(statusData?.tax_type ?? '');
  const endDate = String(statusData?.end_dt ?? '');

  const isActive = businessStatusCode === '01' || businessStatus.includes('계속');

  return NextResponse.json(
    {
      success: isActive,
      businessStatusCode,
      businessStatus,
      taxType,
      endDate,
      raw: parsed,
    },
    { status: upstream.ok ? 200 : upstream.status },
  );
}
