export type {
  CrossEdgeId,
  SimulateWhiteCrossLessonResult,
  WhiteCrossStepKind,
  WhiteCrossLessonStep,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/types';

export { WHITE_CROSS_STEP_KINDS } from '@/domains/lesson-engine/layers/bottomLayer/cross/types';

export {
  countSolvedCrossSlots,
  firstUnsolvedCrossId,
  isWhiteCrossComplete,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/crossSlotModel';

export { crossEdgeExampleDemoMoves } from '@/domains/lesson-engine/layers/bottomLayer/cross/crossEdgeDemoMoves';

export { clearVerifiedDemoCache, isVerifiedSlotDemo } from '@/domains/lesson-engine/layers/bottomLayer/cross/crossSolveBfs';

export {
  getWhiteCrossLessonStep,
  getWhiteCrossLessonStepAsync,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/computeLessonStep';

export {
  simulateWhiteCrossLessonOnStorageCube,
  type SimulateWhiteCrossLessonOptions,
} from '@/domains/lesson-engine/layers/bottomLayer/cross/simulateLesson';
