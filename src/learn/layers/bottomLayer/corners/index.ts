export const WHITE_CORNERS_LESSON_ID = 'white-corners' as const

export type {
  CornerSlotId,
  SimulateWhiteCornersLessonOptions,
  SimulateWhiteCornersLessonResult,
  WhiteCornerLessonStepOptions,
  WhiteCornersLessonStep,
  WhiteCornersStepKind,
} from './types'

export { CORNER_ORDER, WHITE_CORNERS_STEP_KINDS } from './types'

export {
  activeCornerId,
  cornerSlotSolved,
  cornersSolvedInState,
  cornersToPreserve,
  mustPreserveCornerIds,
  countSolvedCornerSlots,
  expectedCornerColors,
  formatColor,
  formatCornerLabel,
  isWhiteCornersComplete,
} from './cornerSlotModel'

export type { CornerCase, ULayerCornerId, WrongDLayerSlotId } from './cornerCases'
export {
  cornerSolvedAtLessonHold,
  cornerSolvedInFrdView,
  dLayerCornerIdAtPosition,
  findTargetCornerPiecePosition,
  isCornerOnDLayer,
  isCornerOnULayer,
  isCornerPieceInSlot,
  recognizeCornerCase,
  recognizeCornerCaseInFrdView,
  U_LAYER_CORNER_POS,
  uLayerCornerIdAtPosition,
} from './cornerCases'

export type { CornerHoldIndex } from './cornerHold'
export {
  CORNER_HOLD_INDEX,
  faceColorAtHold,
  formatHoldFaceLabel,
  frdViewDemoAtHold,
  holdIndexToY,
  normalizeHoldToBlue,
  relativeY,
  returnToBlueY,
  stateAtHold,
  targetHoldIndex,
} from './cornerHold'

export {
  cornerPreservedAtLessonHold,
  cornerTargetSolvedAtHold,
  isLessonStateValid,
  isVerifiedCornerSlotDemo,
  preservesLessonStateAfterDemo,
} from './preserveLessonState'

export {
  FRD_WHITE_ON_F,
  FRD_WHITE_ON_R,
  tryDirectSolveStepForCornerId,
  tryFrdTwistedInSlot,
  tryFrdULayerInsert,
  tryFrdWrongDLayerExtract,
} from './directSolveSteps'

export {
  alignMovesToUrf,
  buildFrdULayerDemo,
  FRD_ALIGN_TO_URF,
  FRD_URF_POS,
  FRD_URF_WHITE_ON_F,
  FRD_URF_WHITE_ON_R,
  FRD_URF_WHITE_ON_U,
  insertMovesFromUrf,
} from './uLayerSteps'

export {
  buildFrdWrongDLayerDemo,
  FRD_EXTRACT,
  FRD_WRONG_D_SETUP,
  setupMovesForWrongDSlot,
} from './wrongDLayerSteps'

export {
  clearVerifiedCornerDemoCache,
  cornerDemoChangesState,
  EXHAUSTIVE_CORNER_BFS_CONFIG,
  EXHAUSTIVE_CORNER_SEARCH_TIERS,
  findVerifiedCornerDemoForCornerId,
  findVerifiedCornerDemoForCornerIdAsync,
  INTERACTIVE_CORNER_BFS_CONFIG,
  INTERACTIVE_CORNER_BFS_MAX_MS,
  INTERACTIVE_CORNER_SEARCH_TIERS,
} from './cornerSolveBfs'

export type { CornerBfsSearchConfig, CornerSlotSolveSearchOptions } from './cornerSolveBfs'

export {
  translateDemoForHoldView,
  unwrapStorageDemoForHold,
} from './demoMovesForHoldView'

export {
  isStudentFacingDemo,
  resolveLessonStorageDemo,
  storageDemoForStudentDemo,
  studentBlueView,
  studentHoldView,
  verifiedFrdDemoAtHold,
} from './frdViewDemoBuild'

export { getWhiteCornerLessonStep, getWhiteCornerLessonStepAsync } from './computeLessonStep'

export {
  simulateWhiteCornersLessonOnStorageCube,
  simulateWhiteCornersLessonOnStorageCubeAsync,
} from './simulateLesson'
