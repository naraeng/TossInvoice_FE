 'use client';

import { useState } from 'react';

import PageContainer from '@/components/layout/PageContainer';
import LoginInfoForm from '@/features/signup/account/LoginInfoForm';
import SignupIntro from '@/features/signup/account/SignupIntro';
import TermsConsentForm from '@/features/signup/account/TermsConsentForm';

export default function SignupAccountPage() {
  const [requiredTermsAgreed, setRequiredTermsAgreed] = useState(false);
  const [submitState, setSubmitState] = useState({ canSubmit: false, isSubmitting: false });
  const formId = 'signup-account-form';

  return (
    <PageContainer className="pb-8 pt-8">
      <SignupIntro
        canSubmit={submitState.canSubmit}
        submitting={submitState.isSubmitting}
        submitFormId={formId}
      />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-x-10 xl:gap-x-12">
        <LoginInfoForm
          requiredTermsAgreed={requiredTermsAgreed}
          formId={formId}
          onSubmitStateChange={setSubmitState}
        />
        <TermsConsentForm onRequiredConsentChange={setRequiredTermsAgreed} />
      </div>
    </PageContainer>
  );
}
