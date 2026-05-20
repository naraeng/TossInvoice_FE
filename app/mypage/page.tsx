'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/components/layout/PageContainer';
import LoginInfoSection from '@/features/mypage/LoginInfoSection';
import MemberInfoSection from '@/features/mypage/MemberInfoSection';
import MyPageTopSection from '@/features/mypage/MyPageTopSection';
import { getDisplayProfile, saveMemberProfile, type MemberProfile } from '@/lib/auth-user';
import { apiClient } from '@/lib/api';
import { isRememberLoginEnabled } from '@/lib/auth-storage';
import { useAuthGuard } from '@/lib/auth-guard';

type MyInfoApiResult = {
  email?: string;
  phone?: string;
  companyName?: string;
  businessNumber?: string;
  ceoName?: string;
  companyType?: string;
  businessType?: string;
  address?: string;
  bank?: string;
  account?: string;
  // 백엔드 MyPageResponse 의 GCS public URL
  businessRegistrationUrl?: string;
  bankbookUrl?: string;
};

type MyInfoApiResponse = {
  result?: MyInfoApiResult | null;
};

const EMPTY_PROFILE: MemberProfile = {
  email: '',
  phone: '',
  companyName: '',
  businessNumber: '',
  ceoName: '',
  companyType: '',
  address: '',
  bank: '',
  account: '',
  accountHolder: '',
  businessType: '',
};

function normalizeMyInfoToProfile(data: MyInfoApiResult): Partial<MemberProfile> {
  return {
    email: data.email ?? '',
    phone: data.phone ?? '',
    companyName: data.companyName ?? '',
    businessNumber: data.businessNumber ?? '',
    ceoName: data.ceoName ?? '',
    companyType: data.companyType ?? '',
    businessType: data.businessType ?? '',
    address: data.address ?? '',
    bank: data.bank ?? '',
    account: data.account ?? '',
    // 첨부 서류 URL 도 함께 보존
    businessRegistrationUrl: data.businessRegistrationUrl?.trim() || undefined,
    bankbookUrl: data.bankbookUrl?.trim() || undefined,
  };
}

export default function MyPage() {
  const router = useRouter();
  const { ready } = useAuthGuard();
  const [profile, setProfile] = useState<MemberProfile>(EMPTY_PROFILE);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    // Hydration-safe: read local profile only after mount.
    const localProfile = getDisplayProfile();
    setProfile((prev) => ({ ...prev, ...localProfile }));

    void (async () => {
      try {
        const res = await apiClient.get('/api/v1/users/me');
        const result = (res.data as MyInfoApiResponse)?.result;
        if (!result || cancelled) return;
        const normalized = normalizeMyInfoToProfile(result);
        saveMemberProfile(normalized, isRememberLoginEnabled());
        if (!cancelled) {
          setProfile((prev) => ({ ...prev, ...normalized }));
        }
      } catch {
        // Keep fallback profile from local storage/JWT when API fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="bg-white text-slate-900">
        <PageContainer className="py-8">
          <p className="text-sm text-slate-500">마이페이지를 불러오는 중…</p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900">
      <PageContainer className="pb-12 pt-8">
        <MyPageTopSection onEditClick={() => router.push('/mypage/edit')} />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-x-10 xl:gap-x-12">
          <LoginInfoSection profile={profile} />
          <MemberInfoSection profile={profile} />
        </div>
      </PageContainer>
    </div>
  );
}
