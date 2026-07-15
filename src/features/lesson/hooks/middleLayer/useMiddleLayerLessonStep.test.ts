import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type Move,
} from '@/domains/cube/cubeState';
import { parseFaceTurnAlgToMoves } from '@/domains/cube/parseFaceTurnAlg';
import { RIGHT_INSERT } from '@/domains/lesson-engine/layers/middleLayer/edges/index';
import { useCubeStore } from '@/app/store/cubeStore';
import { useMiddleLayerLessonStep } from '@/features/lesson/hooks/middleLayer/useMiddleLayerLessonStep';
import { useLessonSessionStore } from '@/features/lesson/store/lessonSessionStore';

function invertMoves(moves: Move[]): Move[] {
  const inverted: Move[] = [];
  for (let i = moves.length - 1; i >= 0; i -= 1) {
    const move = moves[i]!;
    const face = move[0];
    if (move.endsWith('2')) inverted.push(move);
    else if (move.endsWith("'")) inverted.push(face as Move);
    else inverted.push(`${face}'` as Move);
  }
  return inverted;
}

describe('useMiddleLayerLessonStep', () => {
  beforeEach(() => {
    useCubeStore.setState({ cubeState: null });
    useLessonSessionStore.getState().clearAllSessions();
  });

  it('returns cross-corners-prerequisite when bottom layer is incomplete', async () => {
    const storage = applyMoves(
      createSolvedCubeState(),
      parseFaceTurnAlgToMoves("R U R'"),
    );
    const studentFrame = cubeStateToStudentFrame(storage);

    const { result } = renderHook(() =>
      useMiddleLayerLessonStep(studentFrame),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('cross-corners-prerequisite');
  });

  it('returns strategy intro before first edge solve', async () => {
    const studentFrame = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      invertMoves(RIGHT_INSERT),
    );

    const { result } = renderHook(() =>
      useMiddleLayerLessonStep(studentFrame),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('intro');
  });

  it('keeps strategy intro dismissed after inserting an edge', async () => {
    const studentFrame = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      invertMoves(RIGHT_INSERT),
    );

    const { result } = renderHook(() =>
      useMiddleLayerLessonStep(studentFrame),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('intro');

    const introStep = result.current.step;
    if (introStep?.kind !== 'intro') throw new Error('expected intro step');

    result.current.advanceAfterStep(introStep, studentFrame);
    await waitFor(() => {
      expect(result.current.hasSeenStrategyIntro).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
      expect(result.current.step?.kind).not.toBe('intro');
    });

    const solveStep = result.current.step;
    if (solveStep?.kind !== 'solve-edge' || solveStep.action !== 'insert') {
      return;
    }

    result.current.advanceAfterStep(solveStep, studentFrame);
    await waitFor(() => {
      expect(result.current.hasSeenStrategyIntro).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
      expect(result.current.step?.kind).not.toBe('intro');
    });
  });

  it('returns complete on solved cube with all middle edges placed', async () => {
    const studentFrame = cubeStateToStudentFrame(createSolvedCubeState());

    const { result } = renderHook(() =>
      useMiddleLayerLessonStep(studentFrame),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('complete');
    expect(result.current.isLessonComplete).toBe(true);
    expect(result.current.solvedSlots).toBe(4);
  });
});
