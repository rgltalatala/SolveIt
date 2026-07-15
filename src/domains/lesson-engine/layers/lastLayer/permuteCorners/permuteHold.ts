import { applyMoves } from '@/domains/cube/cubeState';
import type { CubeState, Move } from '@/domains/cube/cubeState';
import {
  relativeY,
  type CornerHoldIndex,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
import type { ULayerCornerId } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerCases';
import { cornerPermutedAtSlot } from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/uLayerCornerPermuteModel';

/** World U-corner slot that moves to URF after setup y from blue-front hold. */
const SETUP_SLOT_BY_TARGET_HOLD: Record<CornerHoldIndex, ULayerCornerId> = {
  0: 'URF',
  1: 'UBR',
  2: 'ULB',
  3: 'UFL',
};

export const WORLD_URF_SLOT: ULayerCornerId = 'URF';

export function holdIndexToBringSlotToWorldUrf(
  slotId: ULayerCornerId,
): CornerHoldIndex {
  for (const hold of [0, 1, 2, 3] as CornerHoldIndex[]) {
    if (SETUP_SLOT_BY_TARGET_HOLD[hold] === slotId) return hold;
  }
  return 0;
}

/** Pick a whole-cube y reorient that places the permuted corner at world URF. */
export function findReorientToPlacePermutedCornerAtWorldUrf(
  state: CubeState,
  currentHoldIndex: CornerHoldIndex,
): { targetHoldIndex: CornerHoldIndex; demoMoves: Move[] } | null {
  if (cornerPermutedAtSlot(state, WORLD_URF_SLOT)) {
    return { targetHoldIndex: currentHoldIndex, demoMoves: [] };
  }

  for (const targetHold of [0, 1, 2, 3] as CornerHoldIndex[]) {
    const demoMoves = relativeY(currentHoldIndex, targetHold);
    const after = applyMoves(state, demoMoves);
    if (cornerPermutedAtSlot(after, WORLD_URF_SLOT)) {
      return { targetHoldIndex: targetHold, demoMoves };
    }
  }

  return null;
}
