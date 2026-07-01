import { useCallback, useEffect, useRef } from 'react';
import type { CubeState } from '../../../cube/cubeState';
import {
  countSolvedCrossSlots,
  getWhiteCrossLessonStepAsync,
} from '../../../learn/layers/bottomLayer/cross';
import type { WhiteCrossLessonStep } from '../../../learn/layers/bottomLayer/cross/types';
import {
  useLessonSessionStore,
  type WhiteCrossSession,
} from '../../../store/lessonSessionStore';
import { useLessonStep } from '../useLessonStep';

export { PREPARING_OVERLAY_DELAY_MS } from '../useLessonStep';

const LESSON_ID = 'white-cross' as const;

function emptyCrossSession(): WhiteCrossSession {
  return { hasSeenStrategyIntro: false };
}

export function useWhiteCrossLessonStep(studentFrame: CubeState | null) {
  const storedSession = useLessonSessionStore(
    (state) => state.sessionsByLesson[LESSON_ID],
  );
  const setStoredSession = useLessonSessionStore((state) => state.setSession);
  const initializedRef = useRef(false);
  const hasSeenStrategyIntroRef = useRef(false);

  const applyCrossSession = useCallback(
    (session: WhiteCrossSession) => {
      hasSeenStrategyIntroRef.current = session.hasSeenStrategyIntro;
      setStoredSession(LESSON_ID, session);
    },
    [setStoredSession],
  );

  const resetStrategyIntro = useCallback(() => {
    applyCrossSession(emptyCrossSession());
  }, [applyCrossSession]);

  useEffect(() => {
    if (!studentFrame) return;
    const existing = useLessonSessionStore.getState().getSession(LESSON_ID);
    if (existing) {
      hasSeenStrategyIntroRef.current = existing.hasSeenStrategyIntro;
      initializedRef.current = true;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;
    resetStrategyIntro();
  }, [studentFrame, resetStrategyIntro]);

  useEffect(() => {
    if (storedSession) {
      hasSeenStrategyIntroRef.current = storedSession.hasSeenStrategyIntro;
    }
  }, [storedSession]);

  const hasSeenStrategyIntro =
    storedSession?.hasSeenStrategyIntro ?? hasSeenStrategyIntroRef.current;
  const sessionKey = String(hasSeenStrategyIntro);

  const getStepAsync = useCallback(async (frame: CubeState) => {
    return getWhiteCrossLessonStepAsync(frame, {
      hasSeenStrategyIntro: hasSeenStrategyIntroRef.current,
    });
  }, []);

  const isComplete = useCallback(
    (step: WhiteCrossLessonStep | null) => step?.kind === 'complete',
    [],
  );

  const countProgress = useCallback(
    (frame: CubeState) => countSolvedCrossSlots(frame),
    [],
  );

  const result = useLessonStep(studentFrame, {
    getStepAsync,
    isComplete,
    countProgress,
    sessionKey,
  });

  const advanceAfterStep = useCallback(
    (appliedStep: WhiteCrossLessonStep) => {
      if (appliedStep.kind === 'intro') {
        applyCrossSession({ hasSeenStrategyIntro: true });
      }
    },
    [applyCrossSession],
  );

  return {
    ...result,
    hasSeenStrategyIntro,
    advanceAfterStep,
    resetStrategyIntro,
  };
}
