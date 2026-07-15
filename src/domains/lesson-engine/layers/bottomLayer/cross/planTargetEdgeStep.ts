import type { CubeState, Move } from '@/domains/cube/cubeState';
import {
  whiteCrossSteps,
  whitePartnerEdgeHeading,
} from '@/content/beginner/whiteCross';
import { whiteEdgeIdentity } from '@/content/beginner/pieceIdentity';
import {
  firstUnsolvedCrossId,
  formatColor,
  partnerColorForSlot,
  SLOT_DEF,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/crossSlotModel';
import {
  tryDLayerInsertStepForCrossId,
  tryRotateBottomStepForCrossId,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/dLayerSteps';
import {
  tryDirectSolveStepForCrossId,
  tryDirectSolveStepForCrossIdAsync,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/directSolveSteps';
import {
  findVerifiedAlignDemoForCrossId,
  findVerifiedAlignDemoForCrossIdAsync,
  findVerifiedSlotDemoForCrossId,
  findVerifiedSlotDemoForCrossIdAsync,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/crossSolveBfs';
import { tryMiddleLayerAlignStepForCrossId } from '@/domains/lesson-engine/layers/bottomLayer/cross/middleLayerSteps';
import {
  tryULayerAlignStepForCrossId,
  tryULayerInsertStepForCrossId,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/uLayerCrossSteps';
import {
  edgeAlignedToSideCenter,
  findEdgeWithColors,
} from '@/domains/lesson-engine/layers/bottomLayer/shared/pieceQueries';
import type { CrossEdgeId, WhiteCrossLessonStep } from '@/domains/lesson-engine/layers/bottomLayer/cross/types';

function buildAlignFromBfs(
  studentState: CubeState,
  id: CrossEdgeId,
  demo: Move[],
): WhiteCrossLessonStep {
  const partner = partnerColorForSlot(studentState, id);
  const edgeLabel = whiteEdgeIdentity(partner);
  const label = `${formatColor(partner)} edge`;
  const slot = SLOT_DEF[id];
  return {
    kind: 'align-to-center',
    title: whitePartnerEdgeHeading(partner),
    edgeLabel: label,
    partnerColor: partner,
    body: whiteCrossSteps.alignBfs(formatColor(partner), edgeLabel),
    practiceGoalSummary: whiteCrossSteps.alignBfsSummary(formatColor(partner)),
    face: slot.sideFace,
    demoMoves: demo,
  };
}

function buildSolveEdgeStep(
  studentState: CubeState,
  id: CrossEdgeId,
  demo: Move[],
): WhiteCrossLessonStep {
  const partner = partnerColorForSlot(studentState, id);
  const edgeLabel = whiteEdgeIdentity(partner);
  const label = `${formatColor(partner)} edge`;
  return {
    kind: 'solve-edge',
    title: whitePartnerEdgeHeading(partner),
    body: whiteCrossSteps.solveEdge(formatColor(partner), edgeLabel),
    practiceGoalSummary: whiteCrossSteps.solveEdgeSummary(formatColor(partner)),
    edgeLabel: label,
    partnerColor: partner,
    demoMoves: demo,
  };
}

function buildSolveEdgeFromVerifiedDemo(
  studentState: CubeState,
  id: CrossEdgeId,
  verifiedDemo: Move[],
): WhiteCrossLessonStep {
  return buildSolveEdgeStep(studentState, id, verifiedDemo);
}

function isTargetAligned(studentState: CubeState, id: CrossEdgeId): boolean {
  const partner = partnerColorForSlot(studentState, id);
  const edgePosition = findEdgeWithColors(studentState, 'white', partner);
  if (!edgePosition) return false;
  return edgeAlignedToSideCenter(studentState, edgePosition) !== null;
}

function tryInsertStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  return (
    tryULayerInsertStepForCrossId(studentState, id) ??
    tryDirectSolveStepForCrossId(studentState, id)
  );
}

async function tryInsertStepForCrossIdAsync(
  studentState: CubeState,
  id: CrossEdgeId,
): Promise<WhiteCrossLessonStep | null> {
  const sync = tryULayerInsertStepForCrossId(studentState, id);
  if (sync) return sync;

  return tryDirectSolveStepForCrossIdAsync(studentState, id);
}

function tryAlignToCenterStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  return (
    tryMiddleLayerAlignStepForCrossId(studentState, id) ??
    tryULayerAlignStepForCrossId(studentState, id) ??
    (() => {
      const demo = findVerifiedAlignDemoForCrossId(studentState, id);
      return demo?.length ? buildAlignFromBfs(studentState, id, demo) : null;
    })()
  );
}

async function tryAlignToCenterStepForCrossIdAsync(
  studentState: CubeState,
  id: CrossEdgeId,
): Promise<WhiteCrossLessonStep | null> {
  const ruleBased =
    tryMiddleLayerAlignStepForCrossId(studentState, id) ??
    tryULayerAlignStepForCrossId(studentState, id);
  if (ruleBased) return ruleBased;

  const demo = await findVerifiedAlignDemoForCrossIdAsync(studentState, id);
  return demo?.length ? buildAlignFromBfs(studentState, id, demo) : null;
}

function tryBfsFallbackStep(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  const demo = findVerifiedSlotDemoForCrossId(studentState, id);
  if (!demo?.length) return null;
  return buildSolveEdgeFromVerifiedDemo(studentState, id, demo);
}

async function tryBfsFallbackStepAsync(
  studentState: CubeState,
  id: CrossEdgeId,
): Promise<WhiteCrossLessonStep | null> {
  const demo = await findVerifiedSlotDemoForCrossIdAsync(studentState, id);
  if (!demo?.length) return null;
  return buildSolveEdgeFromVerifiedDemo(studentState, id, demo);
}

export function planTargetEdgeStep(
  studentState: CubeState,
): WhiteCrossLessonStep | null {
  const targetId = firstUnsolvedCrossId(studentState);
  if (!targetId) return null;

  const rotate = tryRotateBottomStepForCrossId(studentState, targetId);
  if (rotate) return rotate;

  const dLayerInsert = tryDLayerInsertStepForCrossId(studentState, targetId);
  if (dLayerInsert) return dLayerInsert;

  if (isTargetAligned(studentState, targetId)) {
    return (
      tryInsertStepForCrossId(studentState, targetId) ??
      tryBfsFallbackStep(studentState, targetId)
    );
  }

  return (
    tryAlignToCenterStepForCrossId(studentState, targetId) ??
    tryBfsFallbackStep(studentState, targetId)
  );
}

export async function planTargetEdgeStepAsync(
  studentState: CubeState,
): Promise<WhiteCrossLessonStep | null> {
  const targetId = firstUnsolvedCrossId(studentState);
  if (!targetId) return null;

  const rotate = tryRotateBottomStepForCrossId(studentState, targetId);
  if (rotate) return rotate;

  const dLayerInsert = tryDLayerInsertStepForCrossId(studentState, targetId);
  if (dLayerInsert) return dLayerInsert;

  if (isTargetAligned(studentState, targetId)) {
    return (
      (await tryInsertStepForCrossIdAsync(studentState, targetId)) ??
      (await tryBfsFallbackStepAsync(studentState, targetId))
    );
  }

  return (
    (await tryAlignToCenterStepForCrossIdAsync(studentState, targetId)) ??
    (await tryBfsFallbackStepAsync(studentState, targetId))
  );
}

export function stuckPartnerStep(studentState: CubeState): WhiteCrossLessonStep {
  const targetId = firstUnsolvedCrossId(studentState);
  const stuckPartner = targetId
    ? partnerColorForSlot(studentState, targetId)
    : 'white';
  return {
    kind: 'solve-edge',
    title: whitePartnerEdgeHeading(stuckPartner),
    body: whiteCrossSteps.stuck(whiteEdgeIdentity(stuckPartner)),
    edgeLabel: `${formatColor(stuckPartner)} edge`,
    partnerColor: stuckPartner,
  };
}
