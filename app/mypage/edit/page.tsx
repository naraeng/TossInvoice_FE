'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/components/layout/PageContainer';
import { apiClient } from '@/lib/api';
import { getDisplayProfile, saveMemberProfile, type MemberProfile } from '@/lib/auth-user';
import { isRememberLoginEnabled } from '@/lib/auth-storage';
import DocumentUploadSection, {
  type OcrExtractedData,
  type OcrGateStatus,
} from '@/features/mypage/edit/DocumentUploadSection';
import EditableLoginInfoSection from '@/features/mypage/edit/EditableLoginInfoSection';
import ReadonlyMemberInfoSection from '@/features/mypage/edit/ReadonlyMemberInfoSection';
import NtsVerifySection from '@/features/mypage/edit/NtsVerifySection';
import MyPageTopSection from '@/features/mypage/MyPageTopSection';

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
  };
}

export default function MyPageEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile>(EMPTY_PROFILE);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ocrExtracted, setOcrExtracted] = useState<OcrExtractedData | null>(null);
  const [ocrGateStatus, setOcrGateStatus] = useState<OcrGateStatus>('idle');
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ntsBlocking, setNtsBlocking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
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
        // keep fallback
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const passwordValid = useMemo(() => password.length >= 8 && password.length <= 100, [password]);
  const passwordMatched = useMemo(
    () => confirmPassword.length > 0 && password === confirmPassword,
    [confirmPassword, password],
  );

  const handleOcrGateChange = useCallback((status: OcrGateStatus) => {
    setOcrGateStatus(status);
  }, []);

  const handleOcrExtracted = useCallback((data: OcrExtractedData | null) => {
    setOcrExtracted(data);
    if (!data) setNtsBlocking(false);
  }, []);

  const handleOcrBusyChange = useCallback((busy: boolean) => {
    setOcrBusy(busy);
  }, []);

  const handleNtsBlockingChange = useCallback((isBlocking: boolean) => {
    setNtsBlocking(isBlocking);
  }, []);

  const displayProfile = useMemo<MemberProfile>(() => {
    if (!ocrExtracted) return profile;
    return {
      ...profile,
      companyName: ocrExtracted.companyName || profile.companyName,
      businessNumber: ocrExtracted.businessNumber || profile.businessNumber,
      ceoName: ocrExtracted.ceoName || profile.ceoName,
      businessType: ocrExtracted.businessType || profile.businessType,
      address: ocrExtracted.address || profile.address,
      bank: ocrExtracted.bank || profile.bank,
      account: ocrExtracted.account || profile.account,
      accountHolder: ocrExtracted.accountHolder || profile.accountHolder,
    };
  }, [profile, ocrExtracted]);

  const onSave = async () => {
    setErrorMessage('');

    if (ocrGateStatus !== 'matched') {
      setErrorMessage(
        '사업자등록증과 통장사본 OCR 검증(서류 명칭 일치) 완료 후 수정사항을 등록할 수 있습니다.',
      );
      return;
    }

    if (ntsBlocking) {
      setErrorMessage('국세청 조회 결과 비정상 사업자로 확인되어 수정할 수 없습니다.');
      return;
    }

    if (password && (!passwordValid || !passwordMatched)) {
      setErrorMessage('비밀번호는 8~100자이며, 비밀번호 확인이 일치해야 합니다.');
      return;
    }

    setIsSaving(true);
    try {
      const accountToSave = ocrExtracted?.account || profile.account;
      await apiClient.patch('/api/v1/users/me/account', { account: accountToSave });
      if (password) {
        await apiClient.patch('/api/v1/users/me/password', { password });
      }
      saveMemberProfile(
        {
          ...profile,
          companyName: ocrExtracted?.companyName || profile.companyName,
          businessNumber: ocrExtracted?.businessNumber || profile.businessNumber,
          ceoName: ocrExtracted?.ceoName || profile.ceoName,
          businessType: ocrExtracted?.businessType || profile.businessType,
          address: ocrExtracted?.address || profile.address,
          bank: ocrExtracted?.bank || profile.bank,
          account: accountToSave,
          accountHolder: ocrExtracted?.accountHolder || profile.accountHolder,
        },
        isRememberLoginEnabled(),
      );
      router.push('/mypage');
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error) {
        const response = (
          error as {
            response?: { data?: { message?: string } };
          }
        ).response;
        setErrorMessage(response?.data?.message ?? '회원정보 수정 중 오류가 발생했습니다.');
      } else {
        setErrorMessage('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white text-slate-900">
      <PageContainer className="pb-12 pt-8">
        <MyPageTopSection
          title="회원정보 수정"
          buttonLabel={isSaving ? '저장 중...' : '수정사항 등록'}
          onEditClick={onSave}
          onCancelClick={() => router.push('/mypage')}
        />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-x-10 xl:gap-x-12">
          {/* 왼쪽: 등록된 서류 + 로그인 정보 */}
          <section className="min-w-0 space-y-8">
            <DocumentUploadSection
              onOcrGateChange={handleOcrGateChange}
              onOcrExtracted={handleOcrExtracted}
              onOcrBusyChange={handleOcrBusyChange}
            />
            <EditableLoginInfoSection
              profile={profile}
              password={password}
              confirmPassword={confirmPassword}
              setPassword={setPassword}
              setConfirmPassword={setConfirmPassword}
            />
          </section>

          {/* 오른쪽: 회원정보 + 국세청 정보 확인하기 */}
          <div className="min-w-0 space-y-0">
            <ReadonlyMemberInfoSection
              profile={displayProfile}
              ocrGateStatus={ocrGateStatus}
              errorMessage={errorMessage}
            />
            <NtsVerifySection
              businessNumber={ocrExtracted?.businessNumber ?? ''}
              ocrBusy={ocrBusy}
              onBlockingChange={handleNtsBlockingChange}
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
