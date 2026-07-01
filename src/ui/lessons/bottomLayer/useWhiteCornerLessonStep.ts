import { useCallback, useEffect, useRef } from 'react';
import type { CubeState } from '../../../cube/cubeState';
import { cubeStateToStudentFrame } from '../../../cube/cubeState';
import {
  CORNER_ORDER,
  countSolvedCornerSlots,
  cornerSlotSolved,
  getWhiteCornerLessonStepAsync,
  normalizeHoldToBlue,
  targetHoldIndex,
  WHITE_CORNERS_LESSON_ID,
  type CornerHoldIndex,
  type CornerSlotId,
  type WhiteCornersLessonStep,
} from '../../../learn/layers/bottomLayer/corners';
import { useCubeStore } from '../../../store/cubeStore';
import {
  useLessonSessionStore,
  type WhiteCornersSession,
} from '../../../store/lessonSessionStore';
import { useLessonStep } from '../useLessonStep';

function initialSolvedCornerIds(studentFrame: CubeState): CornerSlotId[] {
  const normalized = normalizeHoldToBlue(studentFrame, 0);
  return CORNER_ORDER.filter((id) => cornerSlotSolved(normalized, id));
}

function emptyCornerSession(): WhiteCornersSession {
  return {
    currentHoldIndex: 0,
    solvedCornerIds: [],
    hasSeenStrategyIntro: false,
    sessionUndoStack: [],
  };
}

export function useWhiteCornerLessonStep(studentFrame: CubeState | null) {
  const storedSession = useLessonSessionStore(
    (state) => state.sessionsByLesson[WHITE_CORNERS_LESSON_ID],
  );
  const setStoredSession = useLessonSessionStore((state) => state.setSession);
  const initializedRef = useRef(false);

  const sessionRef = useRef<WhiteCornersSession>(emptyCornerSession());

  const applyCornerSession = useCallback(
    (session: WhiteCornersSession) => {
      sessionRef.current = session;
      setStoredSession(WHITE_CORNERS_LESSON_ID, session);
    },
    [setStoredSession],
  );

  const resetCornerSession = useCallback(
    (frame: CubeState) => {
      const initial = initialSolvedCornerIds(frame);
      applyCornerSession({
        currentHoldIndex: 0,
        solvedCornerIds: initial,
        hasSeenStrategyIntro: false,
        sessionUndoStack: [],
      });
    },
    [applyCornerSession],
  );

  useEffect(() => {
    if (!studentFrame) return;
    const existing = useLessonSessionStore
      .getState()
      .getSession(WHITE_CORNERS_LESSON_ID);
    if (existing) {
      sessionRef.current = existing;
      initializedRef.current = true;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;
    resetCornerSession(studentFrame);
  }, [studentFrame, resetCornerSession]);

  useEffect(() => {
    if (storedSession) {
      sessionRef.current = storedSession;
    }
  }, [storedSession]);

  const session = storedSession ?? sessionRef.current;
  const { currentHoldIndex, solvedCornerIds, hasSeenStrategyIntro, sessionUndoStack } =
    session;

  const sessionKey = `${currentHoldIndex}:${solvedCornerIds.join(',')}:${hasSeenStrategyIntro}:${sessionUndoStack.length}`;

  const getStepAsync = useCallback(async (_frame: CubeState) => {
    const cube = useCubeStore.getState().cubeState;
    const frame = cube ? cubeStateToStudentFrame(cube) : _frame;
    return getWhiteCornerLessonStepAsync(frame, {
      ...sessionRef.current,
    });
  }, []);

  const isComplete = useCallback(
    (step: WhiteCornersLessonStep | null) => step?.kind === 'complete',
    [],
  );

  const countProgress = useCallback(
    (frame: CubeState) =>
      countSolvedCornerSlots(
        frame,
        sessionRef.current.currentHoldIndex,
        sessionRef.current.solvedCornerIds,
      ),
    [],
  );

  const {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    solvedSlots,
    recomputeStep,
  } = useLessonStep(studentFrame, {
    getStepAsync,
    isComplete,
    countProgress,
    sessionKey,
  });

  const advanceAfterStep = useCallback(
    (appliedStep: WhiteCornersLessonStep) => {
      const current = sessionRef.current;
      if (appliedStep.kind === 'intro') {
        applyCornerSession({
          ...current,
          hasSeenStrategyIntro: true,
        });
        return;
      }

      if (appliedStep.kind === 'reorient-hold') {
        const nextHold = (
          appliedStep.returnToInitialHold
            ? 0
            : appliedStep.targetCornerId
              ? targetHoldIndex(appliedStep.targetCornerId)
              : current.currentHoldIndex
        ) as CornerHoldIndex;
        applyCornerSession({
          ...current,
          currentHoldIndex: nextHold,
          sessionUndoStack: [
            ...current.sessionUndoStack,
            { kind: 'reorient', previousHoldIndex: current.currentHoldIndex },
          ],
        });
        return;
      }

      if (appliedStep.kind === 'solve-corner') {
        const nextIds = current.solvedCornerIds.includes(appliedStep.cornerId)
          ? current.solvedCornerIds
          : [...current.solvedCornerIds, appliedStep.cornerId];
        applyCornerSession({
          currentHoldIndex: current.currentHoldIndex,
          solvedCornerIds: nextIds,
          hasSeenStrategyIntro: current.hasSeenStrategyIntro,
          sessionUndoStack: [
            ...current.sessionUndoStack,
            { kind: 'solve', previousSolvedCornerIds: current.solvedCornerIds },
          ],
        });
      }
    },
    [applyCornerSession],
  );

  const undoCornerSessionStep = useCallback((): 'reorient' | 'solve' | null => {
    const current = sessionRef.current;
    const last = current.sessionUndoStack[current.sessionUndoStack.length - 1];
    if (!last) return null;
    const nextStack = current.sessionUndoStack.slice(0, -1);
    if (last.kind === 'reorient') {
      applyCornerSession({
        ...current,
        currentHoldIndex: last.previousHoldIndex,
        sessionUndoStack: nextStack,
      });
      return 'reorient';
    }
    applyCornerSession({
      ...current,
      solvedCornerIds: last.previousSolvedCornerIds,
      sessionUndoStack: nextStack,
    });
    return 'solve';
  }, [applyCornerSession]);

  return {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    solvedSlots,
    recomputeStep,
    currentHoldIndex,
    solvedCornerIds,
    hasSeenStrategyIntro,
    sessionUndoStack,
    advanceAfterStep,
    undoCornerSessionStep,
    resetCornerSession,
  };
}
