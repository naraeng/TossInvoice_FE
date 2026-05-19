import { cn } from '@/lib/utils';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('mx-auto w-full max-w-screen-xl px-6 md:px-10', className)}>{children}</main>
  );
}
