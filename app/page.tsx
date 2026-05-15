import { Button } from '@/components/ui/button';
import MainContainer from '@/features/main/MainContainer';
import CompareContainer from '@/features/main/CompareContainer';
import ProcessContainer from '@/features/main/ProcessContainer';
import ReasonContainer from '@/features/main/ReasonContainer';
import StartContainer from '@/features/main/StartContainer';
import Header from '@/components/layout/Header';
export default function Home() {
  return (
    <div>
      <div className="relative overflow-hidden bg-[#f6f9ff] text-slate-900">
        <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-8 md:px-10">
          <Header />
          <MainContainer />
          <ReasonContainer />
          <CompareContainer />
          <ProcessContainer />
          <StartContainer /> 
        </main>
      </div>
    </div>
  );
}
