import { LearningCrossView } from './LearningCrossView';
import { LearningCornersView } from './LearningCornersView';
import { LearningMiddleLayerView } from './LearningMiddleLayerView';
import { LearningLastLayerView } from './LearningLastLayerView';
import { LessonResyncView } from './LessonResyncView';
import { LessonTopNav } from './LessonTopNav';
import { NotationIntroPanel } from './NotationIntroPanel';
import { ScanView } from './ScanView';
import { CasesReferenceView } from './lessons/CasesReferenceView';
import { LessonNotationView } from './lessons/LessonNotationView';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import { LAST_LAYER_LESSON_ID } from '../learn/layers/lastLayer';
import { useCubeStore } from '../store/cubeStore';
import { useLessonSessionStore } from '../store/lessonSessionStore';

function ActiveLessonView() {
  const activeLesson = useCubeStore((state) => state.activeLesson);

  if (activeLesson === LAST_LAYER_LESSON_ID) {
    return <LearningLastLayerView />;
  }
  if (activeLesson === MIDDLE_LAYER_EDGES_LESSON_ID) {
    return <LearningMiddleLayerView />;
  }
  if (activeLesson === 'white-corners') {
    return <LearningCornersView />;
  }
  return <LearningCrossView />;
}

function LessonTabContent() {
  const appPhase = useCubeStore((state) => state.appPhase);

  if (appPhase === 'notation') {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NotationIntroPanel />
      </div>
    );
  }
  if (appPhase === 'scanning' || appPhase === 'correcting') {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
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
  if (appPhase === 'learning') {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ActiveLessonView />
      </div>
    );
  }
  return null;
}

export function ReferenceShell() {
  const appPhase = useCubeStore((state) => state.appPhase);
  const learningSection = useLessonSessionStore((state) => state.learningSection);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <LessonTopNav showEndLesson={appPhase === 'learning'} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className={
            learningSection === 'lesson'
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
              : 'hidden'
          }
        >
          <LessonTabContent />
        </div>
        {learningSection === 'notation' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <LessonNotationView />
          </div>
        ) : null}
        {learningSection === 'cases' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CasesReferenceView />
          </div>
        ) : null}
      </div>
    </div>
  );
}
