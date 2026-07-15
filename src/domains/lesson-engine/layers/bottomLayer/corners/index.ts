export const WHITE_CORNERS_LESSON_ID = 'white-corners' as const;

export type {
  CornerSlotId,
  SimulateWhiteCornersLessonResult,
  WhiteCornerLessonStepOptions,
  WhiteCornersLessonStep,
  WhiteCornersStepKind,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/types';

export { CORNER_ORDER, WHITE_CORNERS_STEP_KINDS } from '@/domains/lesson-engine/layers/bottomLayer/corners/types';

export {
  activeCornerId,
  cornerSlotSolved,
  countSolvedCornerSlots,
  expectedCornerColors,
  formatColor,
  isWhiteCornersComplete,
  mustPreserveCornerIds,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerSlotModel';

export {
  whiteCornerIdentity,
  whiteCornerIdentity as formatCornerLabel,
} from '@/content/beginner/pieceIdentity';

export type {
  CornerCase,
  ULayerCornerId,
  WrongDLayerSlotId,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerCases';
export {
  cornerSolvedInFrdView,
  isCornerPieceInSlot,
  recognizeCornerCase,
  recognizeCornerCaseInFrdView,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerCases';

export type { CornerHoldIndex } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
export {
  cornerHoldToStudentHold,
  formatHoldFaceLabel,
  holdIndexToY,
  normalizeHoldToBlue,
  relativeY,
  returnToBlueY,
  targetHoldIndex,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';

export {
  cornerPreservedAtLessonHold,
  cornerTargetSolvedAtHold,
  isLessonStateValid,
  isVerifiedCornerSlotDemo,
  preservesLessonStateAfterDemo,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/preserveLessonState';

export { resolveLessonStorageDemo } from '@/domains/lesson-engine/layers/bottomLayer/corners/frdViewDemoBuild';

export {
  getWhiteCornerLessonStep,
  getWhiteCornerLessonStepAsync,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/computeLessonStep';

export {
  simulateWhiteCornersLessonOnStorageCube,
  simulateWhiteCornersLessonOnStorageCubeAsync,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/simulateLesson';

// Re-exports used by corner lesson tests (import from submodules in new code).
export {
  alignMovesToUrf,
  FRD_URF_WHITE_ON_F,
  FRD_URF_WHITE_ON_R,
  FRD_URF_WHITE_ON_U,
  insertMovesFromUrf,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/uLayerSteps';
export { FRD_WHITE_ON_F, FRD_WHITE_ON_R } from '@/domains/lesson-engine/layers/bottomLayer/corners/directSolveSteps';
