/**
 * 브라우저에서는 항상 same-origin(`/api/v1`) → Next.js Route/rewrite 프록시.
 * `NEXT_PUBLIC_API_BASE_URL`을 클라이언트에 두면 Vercel 등 배포 도메인에서 CORS가 납니다.
 */
export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || '';
}

export function resolveApiOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) {
    return base.replace(/\/$/, '');
  }

  return '';
}
