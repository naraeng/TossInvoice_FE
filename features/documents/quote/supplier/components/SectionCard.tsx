import { cn } from '@/lib/utils';

/** 단일 메인 카드 안의 섹션 구분용 (별도 흰 카드 아님) */
export function SectionBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn('py-6', className)}>{children}</section>;
}

/** @deprecated SectionBlock 사용 */
export const SectionCard = SectionBlock;

export function SectionTitle({
  title,
  badge,
  subtitle,
}: {
  title: string;
  badge?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {badge}
      </div>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}
