import { applyMoves } from '@/domains/cube/cubeState';
import type { CubeState, Move } from '@/domains/cube/cubeState';
import { isLastLayerLessonStateValid } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/preserveLessonState';
import { isYellowCrossComplete } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/uLayerEdgeModel';
import { isEdgesFullyPermuted } from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/uLayerEdgePermuteModel';
import {
  countPermutedCorners,
  isCornersFullyPermuted,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/uLayerCornerPermuteModel';

export function isVerifiedPermuteCornersDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const beforeCount = countPermutedCorners(studentState);
  const after = applyMoves(studentState, demo);
  return (
    isLastLayerLessonStateValid(after) &&
    isYellowCrossComplete(after) &&
    isEdgesFullyPermuted(after) &&
    (isCornersFullyPermuted(after) || countPermutedCorners(after) > beforeCount)
  );
}

export function isVerifiedPermuteCornersReorientDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const after = applyMoves(studentState, demo);
  return (
    isLastLayerLessonStateValid(after) &&
    isYellowCrossComplete(after) &&
    isEdgesFullyPermuted(after) &&
    demo.every(
      (move) => move === 'y' || move === 'y2' || move === "y'",
    )
  );
}
