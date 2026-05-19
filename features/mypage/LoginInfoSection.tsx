import type { MemberProfile } from '@/lib/auth-user';

type LoginInfoSectionProps = {
  profile: MemberProfile;
};

function ReadonlyField({ label, value, subText }: { label: string; value: string; subText?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold text-slate-400">{label}</span>
      <input
        value={value || '-'}
        readOnly
        disabled
        className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-700 outline-none"
      />
      {subText ? <p className="text-[11px] text-slate-400">{subText}</p> : null}
    </label>
  );
}

export default function LoginInfoSection({ profile }: LoginInfoSectionProps) {
  return (
    <section className="min-w-0">
      <h2 className="mb-4 text-lg font-bold text-slate-900">로그인 정보</h2>
      <p className="mb-5 text-xs text-slate-400">기본적인 로그인에 사용되는 정보입니다</p>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <ReadonlyField
          label="이메일 (= 로그인 ID)"
          value={profile.email}
          subText="결제·거래 알림이 이 이메일로 발송됩니다"
        />
        <ReadonlyField label="핸드폰 번호" value={profile.phone} />
      </div>
    </section>
  );
}
