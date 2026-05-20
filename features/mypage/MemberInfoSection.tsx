import type { MemberProfile } from '@/lib/auth-user';
import { formatCompanyType } from '@/lib/format/company-type';

type MemberInfoSectionProps = {
  profile: MemberProfile;
};

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold text-slate-400">{label}</span>
      <input
        value={value || '-'}
        readOnly
        disabled
        className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-700 outline-none"
      />
    </label>
  );
}

/** 등록된 첨부 서류(사업자등록증/통장사본) 노출 */
function DocumentAttachments({ profile }: { profile: MemberProfile }) {
  const businessUrl = profile.businessRegistrationUrl?.trim();
  const bankbookUrl = profile.bankbookUrl?.trim();
  if (!businessUrl && !bankbookUrl) return null;
  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-bold text-slate-900">등록 서류</h3>
      <div className="space-y-2">
        {businessUrl ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="text-xs font-semibold text-slate-700">사업자등록증 (PDF)</span>
            <a
              href={businessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              열기 ↗
            </a>
          </div>
        ) : (
          <p className="text-xs text-slate-400">사업자등록증이 등록되어 있지 않습니다.</p>
        )}
        {bankbookUrl ? (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-700">통장사본</span>
              <a
                href={bankbookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                원본 보기 ↗
              </a>
            </div>
            {/* 통장사본은 이미지(JPG/PNG)라 인라인 미리보기 */}
            <img
              src={bankbookUrl}
              alt="등록된 통장사본"
              className="max-h-40 w-full rounded-md border border-slate-200 object-contain"
            />
          </div>
        ) : (
          <p className="text-xs text-slate-400">통장사본이 등록되어 있지 않습니다.</p>
        )}
      </div>
    </div>
  );
}

export default function MemberInfoSection({ profile }: MemberInfoSectionProps) {
  return (
    <section className="min-w-0">
      <h2 className="mb-4 text-lg font-bold text-slate-900">회원정보</h2>
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <ReadonlyField label="회사명" value={profile.companyName} />
        <ReadonlyField label="사업자등록번호" value={profile.businessNumber} />
        <ReadonlyField label="대표자명" value={profile.ceoName} />
        <ReadonlyField label="과세 유형" value={formatCompanyType(profile.companyType)} />
        <ReadonlyField label="사업장 주소" value={profile.address} />
        <ReadonlyField
          label="은행"
          value={profile.bank && profile.account ? `${profile.bank} ${profile.account}` : ''}
        />
        <ReadonlyField label="업종" value={profile.businessType} />
      </div>
      <DocumentAttachments profile={profile} />
      <p className="mt-3 text-[11px] text-slate-400">
        * OCR 추출 정보는 편집할 수 없어요. 변경하려면 서류를 다시 첨부해주세요.
      </p>
    </section>
  );
}
