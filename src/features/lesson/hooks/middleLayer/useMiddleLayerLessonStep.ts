import { useCallback, useEffect, useRef } from 'react';
import type { CubeState } from '@/domains/cube/cubeState';
import { cubeStateToStudentFrame } from '@/domains/cube/cubeState';
import {
  MIDDLE_EDGE_SLOTS,
  countSolvedMiddleEdgeSlots,
  edgeSlotSolved,
  getMiddleLayerEdgeLessonStepAsync,
  MIDDLE_LAYER_EDGES_LESSON_ID,
  normalizeHoldToBlue,
  slotIdForExpectedEdgeColors,
  type MiddleEdgeSlotId,
  type MiddleLayerEdgesLessonStep,
} from '@/domains/lesson-engine/layers/middleLayer/edges/index';
import { useCubeStore } from '@/app/store/cubeStore';
import {
  useLessonSessionStore,
  type MiddleLayerSession,
} from '@/features/lesson/store/lessonSessionStore';
import { useLessonStep } from '@/features/lesson/hooks/useLessonStep';

function initialSolvedSlots(studentFrame: CubeState): MiddleEdgeSlotId[] {
  const normalized = normalizeHoldToBlue(studentFrame, 0);
  return MIDDLE_EDGE_SLOTS.filter((id) => edgeSlotSolved(normalized, id));
}

function emptyMiddleSession(): MiddleLayerSession {
  return {
    currentHoldIndex: 0,
    solvedMiddleEdgeSlots: [],
    hasSeenStrategyIntro: false,
    sessionUndoStack: [],
  };
}

export function useMiddleLayerLessonStep(studentFrame: CubeState | null) {
  const storedSession = useLessonSessionStore(
    (state) => state.sessionsByLesson[MIDDLE_LAYER_EDGES_LESSON_ID],
  );
  const setStoredSession = useLessonSessionStore((state) => state.setSession);
  const initializedRef = useRef(false);
  const sessionRef = useRef<MiddleLayerSession>(emptyMiddleSession());

  const applyMiddleSession = useCallback(
    (session: MiddleLayerSession) => {
      sessionRef.current = session;
      setStoredSession(MIDDLE_LAYER_EDGES_LESSON_ID, session);
    },
    [setStoredSession],
  );

  const resetMiddleSession = useCallback(
    (frame: CubeState) => {
      const initial = initialSolvedSlots(frame);
      applyMiddleSession({
        currentHoldIndex: 0,
        solvedMiddleEdgeSlots: initial,
        hasSeenStrategyIntro: false,
        sessionUndoStack: [],
      });
    },
    [applyMiddleSession],
  );

  useEffect(() => {
    if (!studentFrame) return;
    const existing = useLessonSessionStore
      .getState()
      .getSession(MIDDLE_LAYER_EDGES_LESSON_ID);
    if (existing) {
      sessionRef.current = existing;
      initializedRef.current = true;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;
    resetMiddleSession(studentFrame);
  }, [studentFrame, resetMiddleSession]);

  useEffect(() => {
    if (storedSession) {
      sessionRef.current = storedSession;
    }
  }, [storedSession]);

  const session = storedSession ?? sessionRef.current;
  const {
    currentHoldIndex,
    solvedMiddleEdgeSlots,
    hasSeenStrategyIntro,
    sessionUndoStack,
  } = session;

  const sessionKey = `${currentHoldIndex}:${solvedMiddleEdgeSlots.join(',')}:${hasSeenStrategyIntro}:${sessionUndoStack.length}`;

  const getStepAsync = useCallback(async (_frame: CubeState) => {
    const cube = useCubeStore.getState().cubeState;
    const frame = cube ? cubeStateToStudentFrame(cube) : _frame;
    const current = sessionRef.current;
    return getMiddleLayerEdgeLessonStepAsync(frame, {
      currentHoldIndex: current.currentHoldIndex,
      solvedMiddleEdgeSlots: current.solvedMiddleEdgeSlots,
      hasSeenStrategyIntro: current.hasSeenStrategyIntro,
    });
  }, []);

  const isComplete = useCallback(
    (step: MiddleLayerEdgesLessonStep | null) => step?.kind === 'complete',
    [],
  );

  const countProgress = useCallback(
    (frame: CubeState) =>
      countSolvedMiddleEdgeSlots(
        frame,
        sessionRef.current.currentHoldIndex,
        sessionRef.current.solvedMiddleEdgeSlots,
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
    (appliedStep: MiddleLayerEdgesLessonStep, frame: CubeState) => {
      const current = sessionRef.current;
      if (appliedStep.kind === 'intro') {
        applyMiddleSession({
          ...current,
          hasSeenStrategyIntro: true,
        });
        return;
      }

      if (appliedStep.kind === 'reorient-hold') {
        let nextHold = current.currentHoldIndex;
        if (appliedStep.returnToInitialHold) {
          nextHold = 0;
        } else if (appliedStep.targetHoldIndex !== undefined) {
          nextHold = appliedStep.targetHoldIndex;
        }
        applyMiddleSession({
          ...current,
          currentHoldIndex: nextHold,
          sessionUndoStack: [
            ...current.sessionUndoStack,
            { kind: 'reorient', previousHoldIndex: current.currentHoldIndex },
          ],
        });
        return;
      }

      if (
        appliedStep.kind === 'solve-edge' &&
        appliedStep.action === 'insert'
      ) {
        const slotId = slotIdForExpectedEdgeColors(
          frame,
          appliedStep.edgeColors,
          current.currentHoldIndex,
        );
        const nextSlots =
          slotId && !current.solvedMiddleEdgeSlots.includes(slotId)
            ? [...current.solvedMiddleEdgeSlots, slotId]
            : current.solvedMiddleEdgeSlots;
        applyMiddleSession({
          ...current,
          solvedMiddleEdgeSlots: nextSlots,
          sessionUndoStack: [
            ...current.sessionUndoStack,
            { kind: 'solve', previousSolvedSlots: current.solvedMiddleEdgeSlots },
          ],
        });
      }
    },
    [applyMiddleSession],
  );

  const undoMiddleSessionStep = useCallback((): 'reorient' | 'solve' | null => {
    const current = sessionRef.current;
    const last = current.sessionUndoStack[current.sessionUndoStack.length - 1];
    if (!last) return null;
    const nextStack = current.sessionUndoStack.slice(0, -1);
    if (last.kind === 'reorient') {
      applyMiddleSession({
        ...current,
        currentHoldIndex: last.previousHoldIndex,
        sessionUndoStack: nextStack,
      });
      return 'reorient';
    }
    applyMiddleSession({
      ...current,
      solvedMiddleEdgeSlots: last.previousSolvedSlots,
      sessionUndoStack: nextStack,
    });
    return 'solve';
  }, [applyMiddleSession]);

  return {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    solvedSlots,
    recomputeStep,
    currentHoldIndex,
    solvedMiddleEdgeSlots,
    hasSeenStrategyIntro,
    sessionUndoStack,
    advanceAfterStep,
    undoMiddleSessionStep,
    resetMiddleSession,
  };
}
