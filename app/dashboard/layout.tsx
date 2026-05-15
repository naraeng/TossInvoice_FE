import MemberHeader from '@/components/layout/MemberHeader';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MemberHeader />
      {children}
    </div>
  );
}