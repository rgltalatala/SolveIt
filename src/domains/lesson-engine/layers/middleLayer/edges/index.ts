export const MIDDLE_LAYER_EDGES_LESSON_ID = 'middle-layer-edges' as const;

export type {
  MiddleEdgeSlotId,
  MiddleLayerEdgeLessonStepOptions,
  MiddleLayerEdgesLessonStep,
  MiddleLayerEdgesStepKind,
  SimulateMiddleLayerEdgesLessonResult,
} from '@/domains/lesson-engine/layers/middleLayer/edges/types';

export {
  MIDDLE_EDGE_SLOTS,
  MIDDLE_LAYER_EDGES_STEP_KINDS,
} from '@/domains/lesson-engine/layers/middleLayer/edges/types';

export {
  countSolvedMiddleEdgeSlots,
  edgeSlotSolved,
  formatColor,
  isMiddleLayerEdgesComplete,
  isMiddleLayerEdgesScrambleValid,
  isMiddleEdgeSlotOnStudentFront,
  holdsWhereSlotIsOnFront,
  middleLayerEdgePairs,
  pickActiveUnsolvedEdge,
  pickBuriedExtractSlot,
  pickPreferredOnUEdge,
  slotIdForExpectedEdgeColors,
  targetFrontSlotBetweenCenters,
} from '@/domains/lesson-engine/layers/middleLayer/edges/edgeSlotModel';

export { normalizeHoldToBlue } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';

export type { CornerHoldIndex } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
export {
  formatColorHoldLabel,
  holdFacingOpposite,
  relativeY,
  reorientMovesToFaceBack,
  targetHoldForColor,
  targetHoldForMiddleEdgeInsert,
} from '@/domains/lesson-engine/layers/middleLayer/edges/edgeHold';

export { LEFT_INSERT, RIGHT_INSERT, algorithmForFrontSlot } from '@/domains/lesson-engine/layers/middleLayer/edges/edgeAlgorithms';

export {
  alignMovesToPartnerCenter,
  isPartnerAlignedToCenter,
  partnerColorOnU,
} from '@/domains/lesson-engine/layers/middleLayer/edges/uLayerAlign';

export {
  isMiddleLayerLessonStateValid,
  isVerifiedMiddleEdgeExtractDemo,
  isVerifiedMiddleEdgeInsertDemo,
} from '@/domains/lesson-engine/layers/middleLayer/edges/preserveLessonState';

export {
  getMiddleLayerEdgeLessonStep,
  getMiddleLayerEdgeLessonStepAsync,
} from '@/domains/lesson-engine/layers/middleLayer/edges/computeLessonStep';

export {
  simulateMiddleLayerEdgesLessonOnStorageCube,
  simulateMiddleLayerEdgesLessonOnStorageCubeAsync,
} from '@/domains/lesson-engine/layers/middleLayer/edges/simulateLesson';
