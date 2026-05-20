import { getAccessToken } from '@/lib/auth-storage';

export type MemberProfile = {
  email: string;
  phone: string;
  companyName: string;
  businessNumber: string;
  ceoName: string;
  companyType: string;
  address: string;
  bank: string;
  account: string;
  // accountHolder는 백엔드 MyPageResponse에 존재하지 않는 필드이지만,
  // OCR 시점에 클라이언트가 검증용으로 잠시 보관하는 경우가 있어 타입에는 남겨두되
  // 마이페이지 표시/저장 흐름에서는 더 이상 신뢰하지 않는다.
  accountHolder: string;
  businessType: string;
  // 등록 서류 URL — 마이페이지에서 첨부 미리보기/다운로드 용도
  businessRegistrationUrl?: string;
  bankbookUrl?: string;
};

const PROFILE_KEY = 'ti-member-profile';

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    return decodeURIComponent(
      binary
        .split('')
        .map((ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
  } catch {
    return null;
  }
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function saveMemberProfile(profile: Partial<MemberProfile>, rememberLogin: boolean) {
  try {
    const prev = getMemberProfile();
    const merged: MemberProfile = {
      email: profile.email ?? prev?.email ?? '',
      phone: profile.phone ?? prev?.phone ?? '',
      companyName: profile.companyName ?? prev?.companyName ?? '',
      businessNumber: profile.businessNumber ?? prev?.businessNumber ?? '',
      ceoName: profile.ceoName ?? prev?.ceoName ?? '',
      companyType: profile.companyType ?? prev?.companyType ?? '',
      address: profile.address ?? prev?.address ?? '',
      bank: profile.bank ?? prev?.bank ?? '',
      account: profile.account ?? prev?.account ?? '',
      accountHolder: profile.accountHolder ?? prev?.accountHolder ?? '',
      businessType: profile.businessType ?? prev?.businessType ?? '',
      businessRegistrationUrl:
        profile.businessRegistrationUrl ?? prev?.businessRegistrationUrl,
      bankbookUrl: profile.bankbookUrl ?? prev?.bankbookUrl,
    };

    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
    const serialized = JSON.stringify(merged);
    if (rememberLogin) {
      localStorage.setItem(PROFILE_KEY, serialized);
    } else {
      sessionStorage.setItem(PROFILE_KEY, serialized);
    }
  } catch {
    // ignore storage failure
  }
}

export function getMemberProfile(): MemberProfile | null {
  try {
    const localRaw = localStorage.getItem(PROFILE_KEY);
    if (localRaw) return JSON.parse(localRaw) as MemberProfile;
    const sessionRaw = sessionStorage.getItem(PROFILE_KEY);
    if (sessionRaw) return JSON.parse(sessionRaw) as MemberProfile;
  } catch {
    return null;
  }
  return null;
}

export function clearMemberProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore storage failure
  }
}

export function getDisplayProfile(): MemberProfile {
  const saved = getMemberProfile();
  const accessToken = getAccessToken();
  const claims = accessToken ? parseJwtPayload(accessToken) : null;

  const tokenEmail =
    (typeof claims?.email === 'string' && claims.email) ||
    (typeof claims?.sub === 'string' && claims.sub) ||
    '';
  const tokenCompany =
    (typeof claims?.companyName === 'string' && claims.companyName) ||
    (typeof claims?.company === 'string' && claims.company) ||
    '';
  const tokenName =
    (typeof claims?.name === 'string' && claims.name) ||
    (typeof claims?.username === 'string' && claims.username) ||
    '';

  return {
    email: saved?.email || tokenEmail,
    phone: saved?.phone || '',
    companyName: saved?.companyName || tokenCompany,
    businessNumber: saved?.businessNumber || '',
    ceoName: saved?.ceoName || tokenName,
    companyType: saved?.companyType || '',
    address: saved?.address || '',
    bank: saved?.bank || '',
    account: saved?.account || '',
    accountHolder: saved?.accountHolder || '',
    businessType: saved?.businessType || '',
    businessRegistrationUrl: saved?.businessRegistrationUrl,
    bankbookUrl: saved?.bankbookUrl,
  };
}
