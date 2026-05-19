import { Button } from '@/components/ui/button';
import MainContainer from '@/features/main/MainContainer';
import CompareContainer from '@/features/main/CompareContainer';
import ProcessContainer from '@/features/main/ProcessContainer';
import ReasonContainer from '@/features/main/ReasonContainer';
import StartContainer from '@/features/main/StartContainer';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-900">
      <Header />
      <div className="relative overflow-hidden">
        <PageContainer className="relative flex flex-col gap-8 pb-24 pt-8">
          <MainContainer />
          <ReasonContainer />
          <CompareContainer />
          <ProcessContainer />
          <StartContainer />
        </PageContainer>
      </div>
    </div>
  );
}
