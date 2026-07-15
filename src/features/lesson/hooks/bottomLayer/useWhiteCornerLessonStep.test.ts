import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '@/domains/cube/cubeState';
import { parseFaceTurnAlgToMoves } from '@/domains/cube/parseFaceTurnAlg';
import { useWhiteCornerLessonStep } from '@/features/lesson/hooks/bottomLayer/useWhiteCornerLessonStep';
import { useLessonSessionStore } from '@/features/lesson/store/lessonSessionStore';

describe('useWhiteCornerLessonStep', () => {
  beforeEach(() => {
    useLessonSessionStore.getState().clearAllSessions();
  });

  it('returns strategy intro before first corner solve', async () => {
    const storage = applyMoves(createSolvedCubeState(), ['F', 'D', "F'"]);
    const studentFrame = cubeStateToStudentFrame(storage);

    const { result } = renderHook(() =>
      useWhiteCornerLessonStep(studentFrame),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('intro');
  });

  it('returns cross-prerequisite when cross is incomplete', async () => {
    const storage = applyMoves(
      createSolvedCubeState(),
      parseFaceTurnAlgToMoves("R U R'"),
    );
    const studentFrame = cubeStateToStudentFrame(storage);

    const { result } = renderHook(() =>
      useWhiteCornerLessonStep(studentFrame),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('cross-prerequisite');
  });
});
