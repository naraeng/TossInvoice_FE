import LoginFooter from '@/features/login/LoginFooter';
import LoginFormCard from '@/features/login/LoginFormCard';
import LoginHeader from '@/features/login/LoginHeader';

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <LoginHeader />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14 md:py-16">
        <LoginFormCard />
        <div className="mt-16 w-full max-w-md sm:mt-20">
          <LoginFooter />
        </div>
      </div>
    </div>
  );
}
