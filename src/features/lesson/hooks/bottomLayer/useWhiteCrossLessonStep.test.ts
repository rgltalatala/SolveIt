import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '@/domains/cube/cubeState';
import { useWhiteCrossLessonStep } from '@/features/lesson/hooks/bottomLayer/useWhiteCrossLessonStep';
import { useLessonSessionStore } from '@/features/lesson/store/lessonSessionStore';

describe('useWhiteCrossLessonStep', () => {
  it('returns strategy intro before first edge solve', async () => {
    useLessonSessionStore.getState().clearAllSessions();
    const storage = applyMoves(createSolvedCubeState(), ['F']);
    const studentFrame = cubeStateToStudentFrame(storage);

    const { result } = renderHook(() =>
      useWhiteCrossLessonStep(studentFrame),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('intro');
  });
});
