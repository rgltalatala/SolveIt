import { useNavigate } from 'react-router';
import type { LastLayerSubLesson } from '@/domains/lesson-engine/layers/lastLayer/index';
import {
  continueToLesson as continueToLessonInStore,
  prepareFreshLessonStart as prepareFreshLessonStartInStore,
  restartFromBeginning as restartFromBeginningInStore,
} from '@/features/lesson/store/lessonSessionPersistence';
import type { ActiveLessonId } from '@/app/store/cubeStore';
import { useCubeStore } from '@/app/store/cubeStore';
import { currentLessonPath, lessonPath } from '@/features/lesson/lessonLoader';

/** Navigate to a lesson URL after updating lesson selection in the store. */
export function useLessonNavigation() {
  const navigate = useNavigate();
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);

  return {
    goToLesson: (
      lessonId: ActiveLessonId,
      subLessonId?: LastLayerSubLesson | null,
    ) => {
      setActiveLesson(lessonId);
      navigate(lessonPath(lessonId, subLessonId));
    },
    continueToLesson: (nextLesson: ActiveLessonId) => {
      continueToLessonInStore(nextLesson);
      navigate(lessonPath(nextLesson));
    },
    prepareFreshLessonStart: (lessonId: ActiveLessonId) => {
      prepareFreshLessonStartInStore(lessonId);
      navigate(lessonPath(lessonId));
    },
    restartFromBeginning: () => {
      restartFromBeginningInStore();
      navigate('/');
    },
    /** Path for the Learn tab when already learning. */
    learnTabPath: () => {
      const appPhase = useCubeStore.getState().appPhase;
      if (appPhase === 'learning') return currentLessonPath();
      return '/';
    },
  };
}
