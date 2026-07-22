import { Navigate } from 'react-router';
import { currentLessonPath } from '@/features/lesson/lessonLoader';
import { NotationIntroPanel } from '@/features/notation/components/NotationIntroPanel';
import { CubeStatePrompt } from '@/features/onboarding/components/CubeStatePrompt';
import { ScrambleSetupView } from '@/features/onboarding/components/ScrambleSetupView';
import { ScanView } from '@/features/scanner/components/ScanView';
import { LessonResyncView } from '@/features/lesson/components/LessonResyncView';
import { useCubeStore } from '@/app/store/cubeStore';

/** Pre-learning pipeline: notation → cube prompt → scan/scramble → lessonResync. */
export function HomePage() {
  const appPhase = useCubeStore((state) => state.appPhase);

  if (appPhase === 'learning') {
    return <Navigate to={currentLessonPath()} replace />;
  }

  if (appPhase === 'notation') {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NotationIntroPanel />
      </div>
    );
  }

  if (appPhase === 'cubePrompt') {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <CubeStatePrompt />
      </div>
    );
  }

  if (appPhase === 'scrambleSetup') {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ScrambleSetupView />
      </div>
    );
  }

  if (appPhase === 'scanning' || appPhase === 'correcting') {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScanView />
      </div>
    );
  }

  if (appPhase === 'lessonResync') {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <LessonResyncView />
      </div>
    );
  }

  return null;
}
