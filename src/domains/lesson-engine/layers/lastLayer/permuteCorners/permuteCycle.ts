import { applyMoves } from '@/domains/cube/cubeState';
import type { CubeState, Move } from '@/domains/cube/cubeState';
import type { CornerHoldIndex } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
import { findReorientToPlacePermutedCornerAtWorldUrf, WORLD_URF_SLOT } from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/permuteHold';
import { PERMUTE_CORNERS_ALG } from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/permuteCornersAlgs';
import {
  cornerPermutedAtSlot,
  isCornersFullyPermuted,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/uLayerCornerPermuteModel';

export type PermuteCornersCycleResult = {
  state: CubeState;
  hold: CornerHoldIndex;
  moves: Move[];
};

/** Repeat permute alg (with URF reorients) until all corners are permuted. */
export function runPermuteCornersUntilFullyPermuted(
  startState: CubeState,
  startHoldIndex: CornerHoldIndex = 0,
): PermuteCornersCycleResult {
  let state = startState;
  let hold = startHoldIndex;
  const moves: Move[] = [];

  while (!isCornersFullyPermuted(state)) {
    if (!cornerPermutedAtSlot(state, WORLD_URF_SLOT)) {
      const setup = findReorientToPlacePermutedCornerAtWorldUrf(state, hold);
      if (setup && setup.demoMoves.length > 0) {
        moves.push(...setup.demoMoves);
        state = applyMoves(state, setup.demoMoves);
        hold = setup.targetHoldIndex;
      }
    }
    moves.push(...PERMUTE_CORNERS_ALG);
    state = applyMoves(state, PERMUTE_CORNERS_ALG);
  }

  return { state, hold, moves };
}

/** Reorient so a permuted corner sits at world URF, if needed. */
export function reorientPermutedCornerToUrfIfNeeded(
  state: CubeState,
  hold: CornerHoldIndex,
): { state: CubeState; hold: CornerHoldIndex; moves: Move[] } {
  if (cornerPermutedAtSlot(state, WORLD_URF_SLOT)) {
    return { state, hold, moves: [] };
  }
  const setup = findReorientToPlacePermutedCornerAtWorldUrf(state, hold);
  if (!setup || setup.demoMoves.length === 0) {
    return { state, hold, moves: [] };
  }
  return {
    state: applyMoves(state, setup.demoMoves),
    hold: setup.targetHoldIndex,
    moves: [...setup.demoMoves],
  };
}
