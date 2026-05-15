import LoginInfoForm from '@/features/signup/account/LoginInfoForm';
import SignupIntro from '@/features/signup/account/SignupIntro';
import TermsConsentForm from '@/features/signup/account/TermsConsentForm';

export default function SignupAccountPage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-6 pb-8 pt-8 md:px-10">
      <SignupIntro />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-x-10 xl:gap-x-12">
        <LoginInfoForm />
        <TermsConsentForm />
      </div>
    </div>
  );
}
