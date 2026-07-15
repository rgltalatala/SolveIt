import type { CubeState, Face, Move } from '@/domains/cube/cubeState';
import {
  whiteCrossSteps,
  whitePartnerEdgeHeading,
} from '@/content/beginner/whiteCross';
import { whiteEdgeIdentity } from '@/content/beginner/pieceIdentity';
import { demoChangesState } from '@/domains/lesson-engine/lessonCore/index';
import {
  formatColor,
  partnerColorForSlot,
  SLOT_DEF,
  slotSolved,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/crossSlotModel';
import {
  findVerifiedSlotDemoForCrossId,
  findVerifiedSlotDemoForCrossIdAsync,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/crossSolveBfs';
import type { CrossEdgeId, WhiteCrossLessonStep } from '@/domains/lesson-engine/layers/bottomLayer/cross/types';

function insertFaceFromDemo(demo: Move[], fallback: Face): Face {
  const faceTurn = demo.find(
    (m) => m === 'F2' || m === 'R2' || m === 'L2' || m === 'B2',
  );
  return faceTurn ? (faceTurn[0] as Face) : fallback;
}

function buildInsertDoubleStep(
  studentState: CubeState,
  id: CrossEdgeId,
  demo: Move[],
): WhiteCrossLessonStep {
  const partner = partnerColorForSlot(studentState, id);
  const slot = SLOT_DEF[id];
  const face = insertFaceFromDemo(demo, slot.sideFace);
  const label = `${formatColor(partner)} edge`;
  return {
    kind: 'insert-double',
    title: whitePartnerEdgeHeading(partner),
    edgeLabel: label,
    partnerColor: partner,
    body: whiteCrossSteps.directSolve(
      formatColor(partner),
      whiteEdgeIdentity(partner),
    ),
    practiceGoalSummary: whiteCrossSteps.directSolveSummary(
      formatColor(partner),
    ),
    face,
    demoMoves: demo,
  };
}

export function tryDirectSolveStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  if (slotSolved(studentState, id)) return null;
  const demo = findVerifiedSlotDemoForCrossId(studentState, id);
  if (!demo?.length || !demoChangesState(studentState, demo)) return null;
  return buildInsertDoubleStep(studentState, id, demo);
}

export async function tryDirectSolveStepForCrossIdAsync(
  studentState: CubeState,
  id: CrossEdgeId,
): Promise<WhiteCrossLessonStep | null> {
  if (slotSolved(studentState, id)) return null;
  const demo = await findVerifiedSlotDemoForCrossIdAsync(studentState, id);
  if (!demo?.length || !demoChangesState(studentState, demo)) return null;
  return buildInsertDoubleStep(studentState, id, demo);
}
