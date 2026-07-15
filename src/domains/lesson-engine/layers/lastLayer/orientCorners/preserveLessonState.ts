import { applyMoves } from '@/domains/cube/cubeState';
import type { CubeState, Move } from '@/domains/cube/cubeState';
import { isLastLayerLessonStateValid } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/preserveLessonState';
import { isYellowCrossComplete } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/uLayerEdgeModel';
import { isEdgesFullyPermuted } from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/uLayerEdgePermuteModel';
import { WORLD_URF_SLOT } from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/permuteHold';
import {
  cornerOrientedAtSlot,
  countSolvedCorners,
  isCornersFullySolved,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/uLayerCornerPermuteModel';

export function isVerifiedOrientCornersDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const beforeSolved = countSolvedCorners(studentState);
  const wasUrfOriented = cornerOrientedAtSlot(studentState, WORLD_URF_SLOT);
  const after = applyMoves(studentState, demo);
  const madeProgress =
    isCornersFullySolved(after) ||
    countSolvedCorners(after) > beforeSolved ||
    (!wasUrfOriented && cornerOrientedAtSlot(after, WORLD_URF_SLOT));

  if (!madeProgress) return false;

  // R' D' R D may temporarily disturb F2L; it will be restored once all corners are oriented.
  if (isCornersFullySolved(after)) {
    return (
      isLastLayerLessonStateValid(after) &&
      isYellowCrossComplete(after) &&
      isEdgesFullyPermuted(after)
    );
  }

  return isYellowCrossComplete(after);
}

export function isVerifiedOrientCornersAlignUDemo(
  studentState: CubeState,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const after = applyMoves(studentState, demo);
  return (
    demo.every((move) => move === 'U' || move === 'U2' || move === "U'") &&
    isYellowCrossComplete(after)
  );
}
