import { cn } from '@/lib/utils';

type HeaderShellProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  sticky?: boolean;
};

/** MemberHeader와 동일한 높이·패딩·최대 너비 */
export default function HeaderShell({
  children,
  className,
  contentClassName,
  sticky = true,
}: HeaderShellProps) {
  return (
    <header
      className={cn(
        'z-20 border-b border-slate-200 bg-white',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto flex h-14 w-full max-w-screen-xl items-center gap-10 px-6 md:px-10',
          contentClassName
        )}
      >
        {children}
      </div>
    </header>
  );
}
