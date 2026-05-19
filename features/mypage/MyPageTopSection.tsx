import { Button } from '@/components/ui/button';

type MyPageTopSectionProps = {
  onEditClick?: () => void;
  onCancelClick?: () => void;
  title?: string;
  buttonLabel?: string;
};

export default function MyPageTopSection({
  onEditClick,
  onCancelClick,
  title = '마이페이지',
  buttonLabel = '회원정보 수정',
}: MyPageTopSectionProps) {
  return (
    <section className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div>
        <p className="text-xs font-semibold text-slate-400">마이페이지</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-4 text-sm text-slate-500">
          내 회원정보입니다. 수정이 필요하면 우측 [회원정보 수정] 버튼을 눌러주세요.
        </p>
      </div>
      <div className="flex items-center gap-2 self-start">
        {onCancelClick ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelClick}
            className="h-11 rounded-xl border-slate-200 px-5 text-sm font-semibold text-slate-700"
          >
            취소
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={onEditClick}
          className="h-11 rounded-xl px-5 text-sm font-semibold shadow-sm"
        >
          {buttonLabel}
        </Button>
      </div>
    </section>
  );
}
