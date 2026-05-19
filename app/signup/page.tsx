'use client';

import { useState } from 'react';

import PageContainer from '@/components/layout/PageContainer';
import InfoPreview from '@/features/signup/document/InfoPreview';
import StepHeader from '@/features/signup/document/StepHeader';

import VerifyForm, { type OcrGateStatus } from '@/features/signup/document/VerifyForm';

export default function SignupPage() {
  const [ocrGateStatus, setOcrGateStatus] = useState<OcrGateStatus>('idle');

  return (
    <PageContainer className="pb-8 pt-8">
      <StepHeader currentStep={1} canProceedToAccount={ocrGateStatus === 'matched'} />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-x-10 xl:gap-x-12">
        <div className="min-w-0">
          <VerifyForm onOcrGateChange={setOcrGateStatus} />
        </div>
        <aside className="min-w-0 lg:border-l lg:border-slate-100 lg:pl-8 xl:pl-10">
          <InfoPreview ocrGateStatus={ocrGateStatus} />
        </aside>
      </div>
    </PageContainer>
  );
}
