export const LAST_LAYER_LESSON_ID = 'last-layer' as const;

export type {
  LastLayerIntroId,
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
  LastLayerStepKind,
  LastLayerSubLesson,
  OrientEdgesOllCase,
  PermuteCornersCaseKind,
  PermuteEdgesCaseKind,
  SeenLastLayerIntros,
  SimulateLastLayerLessonResult,
} from '@/domains/lesson-engine/layers/lastLayer/types';

export {
  ALL_LAST_LAYER_INTROS_SEEN,
  LAST_LAYER_PAST_ORIENT_EDGES,
  LAST_LAYER_INTRO_IDS,
  LAST_LAYER_STEP_KINDS,
  LAST_LAYER_SUB_LESSONS,
} from '@/domains/lesson-engine/layers/lastLayer/types';

export {
  countYellowEdgesOnU,
  isYellowCrossComplete,
  U_LAYER_EDGE_SLOTS,
  yellowEdgeSlotsOnU,
  yellowStickerOnU,
} from '@/domains/lesson-engine/layers/lastLayer/orientEdges/uLayerEdgeModel';

export type { ULayerEdgeId } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/uLayerEdgeModel';

export {
  alignMovesForBar,
  alignMovesForLShape,
  algorithmForOrientEdgesCase,
  BAR_ALG,
  DOT_ALG,
  L_SHAPE_ALG,
} from '@/domains/lesson-engine/layers/lastLayer/orientEdges/orientEdgesAlgs';

export {
  isBarAligned,
  isLShapeAligned,
  recognizeOrientEdgesCase,
} from '@/domains/lesson-engine/layers/lastLayer/orientEdges/orientEdgesCases';

export type { OrientEdgesCase } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/orientEdgesCases';

export {
  isLastLayerLessonStateValid,
  isVerifiedAlignUDemo,
  isVerifiedOrientEdgesDemo,
} from '@/domains/lesson-engine/layers/lastLayer/orientEdges/preserveLessonState';

export {
  countPermutedEdges,
  edgePermutedAtSlot,
  findUPrefixToFullyPermute,
  isEdgesFullyPermuted,
  permutedEdgeSlots,
} from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/uLayerEdgePermuteModel';

export {
  recognizePermuteEdgesCase,
  type PermuteEdgesCase,
} from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/permuteEdgesCases';

export { PERMUTE_EDGES_ALG } from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/permuteEdgesAlgs';

export {
  backRightULayerSlots,
  holdIndexFromFrontColor,
  holdIndexWherePairIsBackRight,
  isPairAtBackRight,
  isPairAtHoldBackRight,
  reorientMovesForPermuteSetup,
} from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/permuteHold';

export { isVerifiedPermuteEdgesDemo } from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/preserveLessonState';

export {
  countPermutedCorners,
  countSolvedCorners,
  cornerOrientedAtSlot,
  cornerOrientedByIdentity,
  countOrientedCornersByIdentity,
  cornerPermutedAtSlot,
  cornerSolvedAtSlot,
  isCornersFullyPermuted,
  isCornersFullySolved,
  isLastLayerComplete,
  permutedCornerSlots,
  unsolvedCornerSlots,
  U_LAYER_CORNER_SLOTS,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/uLayerCornerPermuteModel';

export {
  recognizePermuteCornersCase,
  type PermuteCornersCase,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/permuteCornersCases';

export {
  PERMUTE_CORNERS_ALG,
  ZERO_FLOW_NONE_PERMUTED_SETUP,
  ZERO_FLOW_PERMUTE_CORNERS_FULL,
  ZERO_FLOW_PERMUTE_PHASES,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/permuteCornersAlgs';

export {
  reorientPermutedCornerToUrfIfNeeded,
  runPermuteCornersUntilFullyPermuted,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/permuteCycle';

export { buildZeroFlowPermuteDemo, zeroFlowCaseDemoMetadata } from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/zeroFlowDemo';

export {
  findReorientToPlacePermutedCornerAtWorldUrf,
  holdIndexToBringSlotToWorldUrf,
  WORLD_URF_SLOT,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/permuteHold';

export {
  isVerifiedPermuteCornersDemo,
  isVerifiedPermuteCornersReorientDemo,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/preserveLessonState';

export {
  ORIENT_CORNER_ALG,
  repeatOrientAlg,
} from '@/domains/lesson-engine/layers/lastLayer/orientCorners/orientCornersAlgs';

export {
  orientRepsAtUrf,
  recognizeOrientCornersCase,
  type OrientCornersCase,
} from '@/domains/lesson-engine/layers/lastLayer/orientCorners/orientCornersCases';

export { isVerifiedOrientCornersDemo } from '@/domains/lesson-engine/layers/lastLayer/orientCorners/preserveLessonState';

export {
  computeOrientCornersStep,
  lastLayerCompleteStep,
} from '@/domains/lesson-engine/layers/lastLayer/computeOrientCornersStep';

export {
  computePermuteCornersStep,
} from '@/domains/lesson-engine/layers/lastLayer/computePermuteCornersStep';

export {
  getLastLayerLessonStep,
  getLastLayerLessonStepAsync,
  isOrientCornersPhase,
} from '@/domains/lesson-engine/layers/lastLayer/computeLessonStep';

export {
  simulateLastLayerLessonOnStorageCube,
} from '@/domains/lesson-engine/layers/lastLayer/simulateLesson';

export type { CornerHoldIndex } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
