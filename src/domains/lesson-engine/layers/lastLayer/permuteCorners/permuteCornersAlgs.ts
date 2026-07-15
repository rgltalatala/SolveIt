import { parseFaceTurnAlgToMoves } from '@/domains/cube/parseFaceTurnAlg';
import type { Move } from '@/domains/cube/cubeState';
import { invertMoves } from '@/domains/cube/invertMoves';
import { studentFrameFromSetupMoves } from '@/domains/lesson-engine/studentFrame';
import { buildZeroFlowPermuteDemo } from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/zeroFlowDemo';

export const PERMUTE_CORNERS_ALG: Move[] = parseFaceTurnAlgToMoves(
  "U R U' L' U R' U' L",
);

/** Scramble that yields the none-permuted case at blue-front hold. */
export const ZERO_FLOW_NONE_PERMUTED_SETUP: Move[] = [
  ...PERMUTE_CORNERS_ALG,
  'y2',
  ...invertMoves(PERMUTE_CORNERS_ALG),
];

const ZERO_FLOW_DEMO = buildZeroFlowPermuteDemo(
  studentFrameFromSetupMoves(ZERO_FLOW_NONE_PERMUTED_SETUP),
);

/** Full zero-flow demo moves for the cases viewer. */
export const ZERO_FLOW_PERMUTE_CORNERS_FULL: Move[] = ZERO_FLOW_DEMO.moves;

/** Instruction-line groupings for the zero-flow cases demo. */
export const ZERO_FLOW_PERMUTE_PHASES: readonly Move[][] =
  ZERO_FLOW_DEMO.instructionPhases;
