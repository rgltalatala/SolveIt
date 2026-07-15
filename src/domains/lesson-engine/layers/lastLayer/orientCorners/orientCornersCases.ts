import { applyMoves } from '@/domains/cube/cubeState';
import type { CubeState, Move } from '@/domains/cube/cubeState';
import { alignMovesToUrf } from '@/domains/lesson-engine/layers/bottomLayer/corners/uLayerSteps';
import type { ULayerCornerId } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerCases';
import { WORLD_URF_SLOT } from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/permuteHold';
import {
  cornerOrientedAtSlot,
  isCornersFullySolved,
  unsolvedCornerSlots,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/uLayerCornerPermuteModel';
import { isYellowCrossComplete } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/uLayerEdgeModel';
import { ORIENT_CORNER_ALG, repeatOrientAlg } from '@/domains/lesson-engine/layers/lastLayer/orientCorners/orientCornersAlgs';

export type OrientCornersCase =
  | { kind: 'solved' }
  | { kind: 'needs-align'; alignMoves: Move[] }
  | { kind: 'orient-at-urf'; reps: 2 | 4 };

const U_ALIGN_PREFIXES: Move[][] = [[], ['U'], ['U2'], ["U'"]];

function alignCost(moves: Move[]): number {
  return moves.reduce((sum, move) => (move === 'U2' ? sum + 2 : sum + 1), 0);
}

function findUPrefixToFullySolveCorners(state: CubeState): Move[] | null {
  let best: Move[] | null = null;
  let bestCost = Infinity;
  for (const prefix of U_ALIGN_PREFIXES) {
    const after = applyMoves(state, prefix);
    if (isCornersFullySolved(after)) {
      const cost = alignCost(prefix);
      if (cost < bestCost) {
        bestCost = cost;
        best = [...prefix];
      }
    }
  }
  return best;
}

function closestAlignToUnoriented(
  unoriented: readonly ULayerCornerId[],
): Move[] {
  let best: Move[] | null = null;
  let bestCost = Infinity;
  for (const slotId of unoriented) {
    const moves = alignMovesToUrf(slotId);
    if (moves.length === 0) continue;
    const cost = alignCost(moves);
    if (cost < bestCost) {
      bestCost = cost;
      best = moves;
    }
  }
  return best ?? [];
}

export function orientRepsAtUrf(state: CubeState): 2 | 4 {
  const afterTwo = applyMoves(state, repeatOrientAlg(2));
  if (cornerOrientedAtSlot(afterTwo, WORLD_URF_SLOT)) {
    return 2;
  }
  return 4;
}

export function recognizeOrientCornersCase(
  state: CubeState,
): OrientCornersCase {
  if (!isYellowCrossComplete(state)) {
    throw new Error(
      'recognizeOrientCornersCase requires yellow cross on U',
    );
  }

  if (isCornersFullySolved(state)) {
    return { kind: 'solved' };
  }

  if (!cornerOrientedAtSlot(state, WORLD_URF_SLOT)) {
    return { kind: 'orient-at-urf', reps: orientRepsAtUrf(state) };
  }

  const finishPrefix = findUPrefixToFullySolveCorners(state);
  if (finishPrefix !== null) {
    return { kind: 'needs-align', alignMoves: finishPrefix };
  }

  const unoriented = unsolvedCornerSlots(state).filter(
    (slotId) => !cornerOrientedAtSlot(state, slotId),
  );
  if (unoriented.length > 0) {
    return {
      kind: 'needs-align',
      alignMoves: closestAlignToUnoriented(unoriented),
    };
  }

  return { kind: 'orient-at-urf', reps: orientRepsAtUrf(state) };
}

export { ORIENT_CORNER_ALG };
