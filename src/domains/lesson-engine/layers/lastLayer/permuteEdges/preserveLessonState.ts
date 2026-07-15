import { applyMoves } from '@/domains/cube/cubeState';
import type { CubeState, Move } from '@/domains/cube/cubeState';
import { isLastLayerLessonStateValid } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/preserveLessonState';
import { isYellowCrossComplete } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/uLayerEdgeModel';
import {
  countPermutedEdges,
  isEdgesFullyPermuted,
} from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/uLayerEdgePermuteModel';

export function isVerifiedPermuteEdgesDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const beforeCount = countPermutedEdges(studentState);
  const after = applyMoves(studentState, demo);
  return (
    isLastLayerLessonStateValid(after) &&
    isYellowCrossComplete(after) &&
    (isEdgesFullyPermuted(after) || countPermutedEdges(after) > beforeCount)
  );
}
