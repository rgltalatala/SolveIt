import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import type { CornerHoldIndex } from '../../bottomLayer/corners/cornerHold';
import {
  findReorientToPlacePermutedCornerAtWorldUrf,
  WORLD_URF_SLOT,
} from './permuteHold';
import { PERMUTE_CORNERS_ALG } from './permuteCornersAlgs';
import {
  cornerPermutedAtSlot,
  isCornersFullyPermuted,
} from './uLayerCornerPermuteModel';

export type ZeroFlowPermuteDemo = {
  moves: Move[];
  /** Grouped for case-reference instruction lines (permute, reorient?, repeat). */
  instructionPhases: Move[][];
};

/** Build the full zero-permuted demo: alg once, URF setup, then repeat alg until solved. */
export function buildZeroFlowPermuteDemo(
  nonePermutedState: CubeState,
  startHoldIndex: CornerHoldIndex = 0,
): ZeroFlowPermuteDemo {
  const instructionPhases: Move[][] = [];
  let state = nonePermutedState;
  let hold = startHoldIndex;

  instructionPhases.push([...PERMUTE_CORNERS_ALG]);
  state = applyMoves(state, PERMUTE_CORNERS_ALG);

  let reorientMoves: Move[] = [];
  if (!cornerPermutedAtSlot(state, WORLD_URF_SLOT)) {
    const setup = findReorientToPlacePermutedCornerAtWorldUrf(state, hold);
    if (setup && setup.demoMoves.length > 0) {
      reorientMoves = [...setup.demoMoves];
      state = applyMoves(state, setup.demoMoves);
      hold = setup.targetHoldIndex;
    }
  }
  if (reorientMoves.length > 0) {
    instructionPhases.push(reorientMoves);
  }

  const repeatMoves: Move[] = [];
  while (!isCornersFullyPermuted(state)) {
    if (!cornerPermutedAtSlot(state, WORLD_URF_SLOT)) {
      const setup = findReorientToPlacePermutedCornerAtWorldUrf(state, hold);
      if (setup && setup.demoMoves.length > 0) {
        repeatMoves.push(...setup.demoMoves);
        state = applyMoves(state, setup.demoMoves);
        hold = setup.targetHoldIndex;
      }
    }
    repeatMoves.push(...PERMUTE_CORNERS_ALG);
    state = applyMoves(state, PERMUTE_CORNERS_ALG);
  }
  instructionPhases.push(repeatMoves);

  return {
    moves: instructionPhases.flat(),
    instructionPhases,
  };
}
