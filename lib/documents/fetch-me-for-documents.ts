const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'https://api.tossinvoice.site';

export type MeForDocuments = {
  userId?: number;
  email?: string;
  companyName?: string;
  businessNumber?: string;
  ceoName?: string;
};

type MeApiResponse = {
  result?: MeForDocuments | null;
};

export async function fetchMeForDocuments(authorization: string | null): Promise<MeForDocuments | null> {
  if (!authorization) return null;

  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/v1/users/me`, {
      method: 'GET',
      headers: { Authorization: authorization },
      cache: 'no-store',
    });
    if (!upstream.ok) return null;

    const data = (await upstream.json()) as MeApiResponse;
    return data.result ?? null;
  } catch {
    return null;
  }
}
