import { getAccessToken } from '@/lib/auth-storage';

export type MeProfile = {
  businessNumber?: string;
  companyName?: string;
  ceoName?: string;
};

type MeApiResponse = {
  errorCode: string | null;
  message: string;
  result: MeProfile | null;
};

function resolveMeUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/v1/users/me`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}/api/v1/users/me`;
  return '/api/v1/users/me';
}

export async function fetchMe(): Promise<MeProfile | null> {
  const token = getAccessToken();

  const res = await fetch(resolveMeUrl(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  const data = (await res.json()) as MeApiResponse;
  if (!res.ok) {
    throw new Error(data.message || '내 정보를 불러오지 못했습니다.');
  }

  return data.result ?? null;
}
