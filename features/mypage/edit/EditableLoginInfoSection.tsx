import type { MemberProfile } from '@/lib/auth-user';

function EditableField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
      />
    </label>
  );
}

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

type EditableLoginInfoSectionProps = {
  profile: MemberProfile;
  password: string;
  confirmPassword: string;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
};

export default function EditableLoginInfoSection({
  profile,
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
}: EditableLoginInfoSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-slate-900">로그인 정보</h2>
      <p className="mb-5 text-xs text-slate-400">가입완료 로그인을 위해 사용하는 정보입니다</p>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <ReadonlyField label="이메일 (= 로그인 ID)" value={profile.email} />
        <p className="-mt-2 text-[11px] text-slate-400">결제 거래 알림이 이 이메일로 발송됩니다</p>
        <ReadonlyField label="핸드폰 번호" value={profile.phone} />
        <EditableField
          label="새 비밀번호"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="8자 이상 100자 이하"
        />
        <EditableField
          label="새 비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="비밀번호를 다시 입력해 주세요"
        />
        <p className="-mt-2 text-[11px] text-slate-400">8자 이상 · 영문/숫자/특수문자 조합</p>
      </div>
    </section>
  );
}
