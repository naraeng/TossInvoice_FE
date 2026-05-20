'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/components/layout/PageContainer';
import { apiClient } from '@/lib/api';
import { getDisplayProfile, saveMemberProfile, type MemberProfile } from '@/lib/auth-user';
import { isRememberLoginEnabled } from '@/lib/auth-storage';
import { useAuthGuard } from '@/lib/auth-guard';
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
  // accountHolder는 백엔드 MyPageResponse에 없는 필드. 클라이언트 OCR 검증용으로만 사용.
  businessRegistrationUrl?: string;
  bankbookUrl?: string;
  businessRegistrationFileUrl?: string;
  bankbookFileUrl?: string;
};

function pickDocumentUrls(result: MyInfoApiResult) {
  return {
    businessRegistrationUrl:
      result.businessRegistrationUrl?.trim() ||
      result.businessRegistrationFileUrl?.trim() ||
      '',
    bankbookUrl: result.bankbookUrl?.trim() || result.bankbookFileUrl?.trim() || '',
  };
}

function asBankbookImageFile(file: File): File {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const mime =
    file.type === 'image/png' || ext === 'png' ? 'image/png' : 'image/jpeg';
  const name =
    ext === 'png' || ext === 'jpg' || ext === 'jpeg'
      ? file.name
      : `${file.name}.${mime === 'image/png' ? 'png' : 'jpg'}`;
  if (file.type === mime) return file;
  return new File([file], name, { type: mime, lastModified: file.lastModified });
}

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
  const { ready } = useAuthGuard();
  const [profile, setProfile] = useState<MemberProfile>(EMPTY_PROFILE);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ocrExtracted, setOcrExtracted] = useState<OcrExtractedData | null>(null);
  const [ocrGateStatus, setOcrGateStatus] = useState<OcrGateStatus>('idle');
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ntsBlocking, setNtsBlocking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [businessRegistrationUrl, setBusinessRegistrationUrl] = useState('');
  const [bankbookUrl, setBankbookUrl] = useState('');
  const [bankbookFile, setBankbookFile] = useState<File | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const localProfile = getDisplayProfile();
    setProfile((prev) => ({ ...prev, ...localProfile }));

    void (async () => {
      try {
        const res = await apiClient.get('/api/v1/users/me');
        const result = (res.data as MyInfoApiResponse)?.result;
        if (!result || cancelled) return;
        const normalized = normalizeMyInfoToProfile(result);
        const urls = pickDocumentUrls(result);
        saveMemberProfile(normalized, isRememberLoginEnabled());
        if (!cancelled) {
          // accountHolder는 백엔드에 저장되지 않으므로 OCR 결과만으로 클라이언트가 채운다(이 시점엔 prev 유지).
          setProfile((prev) => ({
            ...prev,
            ...normalized,
          }));
          setBusinessRegistrationUrl(urls.businessRegistrationUrl);
          setBankbookUrl(urls.bankbookUrl);
        }
      } catch {
        // keep fallback
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready]);

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

  const documentProfile = useMemo(
    () => ({
      companyName: profile.companyName,
      businessNumber: profile.businessNumber,
      ceoName: profile.ceoName,
      businessType: profile.businessType,
      address: profile.address,
      bank: profile.bank,
      account: profile.account,
      accountHolder: profile.accountHolder,
      companyType: profile.companyType,
    }),
    [
      profile.companyName,
      profile.businessNumber,
      profile.ceoName,
      profile.businessType,
      profile.address,
      profile.bank,
      profile.account,
      profile.accountHolder,
      profile.companyType,
    ],
  );

  const displayProfile = useMemo<MemberProfile>(() => {
    if (!ocrExtracted) return profile;
    const useOcrBankAccount = Boolean(bankbookFile);
    return {
      ...profile,
      companyName: ocrExtracted.companyName || profile.companyName,
      businessNumber: ocrExtracted.businessNumber || profile.businessNumber,
      ceoName: ocrExtracted.ceoName || profile.ceoName,
      businessType: ocrExtracted.businessType || profile.businessType,
      address: ocrExtracted.address || profile.address,
      bank: useOcrBankAccount ? ocrExtracted.bank : ocrExtracted.bank || profile.bank,
      account: useOcrBankAccount ? ocrExtracted.account : ocrExtracted.account || profile.account,
      accountHolder: ocrExtracted.accountHolder || profile.accountHolder || profile.ceoName,
    };
  }, [profile, ocrExtracted, bankbookFile]);

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

    const bankToSave = (ocrExtracted?.bank || profile.bank).trim();
    const accountToSave = (ocrExtracted?.account || profile.account).trim();
    const bankAccountChanged =
      bankToSave !== profile.bank.trim() || accountToSave !== profile.account.trim();

    if (bankAccountChanged && !bankbookFile) {
      setErrorMessage('은행·계좌번호 변경 시 통장사본을 새로 업로드해 주세요.');
      return;
    }

    if (bankbookFile && (!bankToSave || !accountToSave)) {
      setErrorMessage(
        '통장사본에서 은행·계좌번호를 읽지 못했습니다. 선명한 이미지로 다시 업로드해 주세요.',
      );
      return;
    }

    setIsSaving(true);
    try {
      if (bankbookFile) {
        const formData = new FormData();
        formData.append(
          'data',
          new Blob(
            [JSON.stringify({ bank: bankToSave, account: accountToSave })],
            { type: 'application/json' },
          ),
          'data.json',
        );
        formData.append(
          'bankbook',
          asBankbookImageFile(bankbookFile),
          bankbookFile.name,
        );
        await apiClient.patch('/api/v1/users/me/account', formData);
      }

      if (password) {
        await apiClient.patch('/api/v1/users/me/password', { password });
      }

      const meRes = await apiClient.get('/api/v1/users/me');
      const meResult = (meRes.data as MyInfoApiResponse)?.result;
      if (meResult) {
        const fromApi = normalizeMyInfoToProfile(meResult);
        const urls = pickDocumentUrls(meResult);
        // accountHolder는 서버 응답에 없으므로 저장하지 않는다(클라이언트 OCR 검증용으로만 유지).
        saveMemberProfile(fromApi, isRememberLoginEnabled());
        if (bankbookFile) {
          setBankbookUrl(urls.bankbookUrl);
        }
      }
      router.push('/mypage');
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error) {
        const response = (
          error as {
            response?: { data?: { errorCode?: string; message?: string } };
          }
        ).response;
        const code = response?.data?.errorCode;
        if (code === 'REQUEST_001') {
          setErrorMessage(response?.data?.message ?? '요청 형식이 올바르지 않습니다.');
        } else if (code === 'STORAGE_001') {
          setErrorMessage('업로드 파일이 비어 있습니다. 통장사본을 다시 업로드해 주세요.');
        } else if (code === 'STORAGE_002') {
          setErrorMessage('지원하지 않는 파일 형식입니다. 통장사본은 JPG/PNG만 가능합니다.');
        } else if (code === 'USER_001') {
          setErrorMessage(response?.data?.message ?? '사용자 정보를 찾을 수 없습니다.');
        } else {
          setErrorMessage(response?.data?.message ?? '회원정보 수정 중 오류가 발생했습니다.');
        }
      } else {
        setErrorMessage('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="bg-white text-slate-900">
        <PageContainer className="py-8">
          <p className="text-sm text-slate-500">회원정보 수정 화면을 불러오는 중…</p>
        </PageContainer>
      </div>
    );
  }

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
              profile={documentProfile}
              businessRegistrationUrl={businessRegistrationUrl}
              bankbookUrl={bankbookUrl}
              onOcrGateChange={handleOcrGateChange}
              onOcrExtracted={handleOcrExtracted}
              onOcrBusyChange={handleOcrBusyChange}
              onBankbookFileChange={setBankbookFile}
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
