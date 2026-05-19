import type { MemberProfile } from '@/lib/auth-user';

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

export default function MemberInfoSection({ profile }: MemberInfoSectionProps) {
  return (
    <section className="min-w-0">
      <h2 className="mb-4 text-lg font-bold text-slate-900">회원정보</h2>
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <ReadonlyField label="회사명" value={profile.companyName} />
        <ReadonlyField label="사업자등록번호" value={profile.businessNumber} />
        <ReadonlyField label="대표자명" value={profile.ceoName} />
        <ReadonlyField label="과세 유형" value={profile.companyType || '법인 / 일반 과세자'} />
        <ReadonlyField label="사업장 주소" value={profile.address} />
        <ReadonlyField
          label="은행"
          value={profile.bank && profile.account ? `${profile.bank} ${profile.account}` : ''}
        />
        <ReadonlyField label="예금주" value={profile.accountHolder || profile.ceoName} />
        <ReadonlyField label="업종" value={profile.businessType} />
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        * OCR 추출 정보는 편집할 수 없어요. 변경하려면 서류를 다시 첨부해주세요.
      </p>
    </section>
  );
}
