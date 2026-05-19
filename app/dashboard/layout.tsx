import MemberHeader from '@/components/layout/MemberHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MemberHeader />
      {children}
    </div>
  );
}
