import type { CubeState, Move } from '../../../../cube/cubeState';
import {
  firstUnsolvedCrossId,
  formatColor,
  partnerColorForSlot,
  SLOT_DEF,
  whitePartnerEdgeHeading,
} from './crossSlotModel';
import {
  tryDLayerInsertStepForCrossId,
  tryRotateBottomStepForCrossId,
} from './dLayerSteps';
import {
  tryDirectSolveStepForCrossId,
  tryDirectSolveStepForCrossIdAsync,
} from './directSolveSteps';
import {
  findVerifiedAlignDemoForCrossId,
  findVerifiedAlignDemoForCrossIdAsync,
  findVerifiedSlotDemoForCrossId,
  findVerifiedSlotDemoForCrossIdAsync,
} from './crossSolveBfs';
import { tryMiddleLayerAlignStepForCrossId } from './middleLayerSteps';
import {
  tryULayerAlignStepForCrossId,
  tryULayerInsertStepForCrossId,
} from './uLayerCrossSteps';
import {
  edgeAlignedToSideCenter,
  faceForWhiteOnEdge,
  findEdgeWithColors,
} from '../shared/pieceQueries';
import type { CrossEdgeId, WhiteCrossLessonStep } from './types';

function buildAlignFromBfs(
  studentState: CubeState,
  id: CrossEdgeId,
  demo: Move[],
): WhiteCrossLessonStep {
  const partner = partnerColorForSlot(studentState, id);
  const label = `${formatColor(partner)} edge`;
  const slot = SLOT_DEF[id];
  return {
    kind: 'align-to-center',
    title: whitePartnerEdgeHeading(partner),
    edgeLabel: label,
    partnerColor: partner,
    body: `Connect the ${formatColor(partner)} sticker on the white–${formatColor(partner)} edge to the ${formatColor(partner)} center before slotting white on the bottom. The demo is the shortest alignment sequence we found while keeping other cross edges you already solved in place.`,
    face: slot.sideFace,
    demoMoves: demo,
  };
}

function buildSolveEdgeStep(
  studentState: CubeState,
  id: CrossEdgeId,
  demo: Move[],
  extraNote?: string,
): WhiteCrossLessonStep {
  const partner = partnerColorForSlot(studentState, id);
  const label = `${formatColor(partner)} edge`;
  const note = extraNote ? ` ${extraNote}` : '';
  return {
    kind: 'solve-edge',
    title: whitePartnerEdgeHeading(partner),
    body: `Work the white–${formatColor(partner)} edge: connect its colored sticker to the ${formatColor(partner)} center, then slot white on the bottom.${note} This demo combines setup, alignment, slotting, and undo so other cross edges you already solved stay correct.`,
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
  const partner = partnerColorForSlot(studentState, id);
  const edgePosition = findEdgeWithColors(studentState, 'white', partner);
  const whiteFace = edgePosition
    ? faceForWhiteOnEdge(edgePosition, studentState)
    : null;
  const topLayerWhiteOnSide =
    edgePosition !== null &&
    edgePosition[1] === 1 &&
    whiteFace !== null &&
    whiteFace !== 'U';
  return buildSolveEdgeStep(
    studentState,
    id,
    verifiedDemo,
    topLayerWhiteOnSide
      ? 'This piece is on the top layer with white on a side—we still connect it to the center and slot it rather than only parking white on U.'
      : undefined,
  );
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
    tryDLayerInsertStepForCrossId(studentState, id) ??
    tryULayerInsertStepForCrossId(studentState, id) ??
    tryDirectSolveStepForCrossId(studentState, id)
  );
}

async function tryInsertStepForCrossIdAsync(
  studentState: CubeState,
  id: CrossEdgeId,
): Promise<WhiteCrossLessonStep | null> {
  const sync =
    tryDLayerInsertStepForCrossId(studentState, id) ??
    tryULayerInsertStepForCrossId(studentState, id);
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
    body: `We could not find a short automated demo for the white–${formatColor(stuckPartner)} edge from this position while keeping your other cross edges. Connect its colored sticker to the ${formatColor(stuckPartner)} center on your own, then slot white on the bottom—or reset the scramble and try again.`,
    edgeLabel: `${formatColor(stuckPartner)} edge`,
    partnerColor: stuckPartner,
  };
}
