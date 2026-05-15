import SignupHeader from '@/components/layout/SignupHeader';
import { SignupDocumentFilesProvider } from '@/features/signup/SignupDocumentFilesProvider';

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-0 flex flex-col">
      <SignupHeader />
      <SignupDocumentFilesProvider>
        <div className="flex-1">{children}</div>
      </SignupDocumentFilesProvider>
    </div>
  );
}
