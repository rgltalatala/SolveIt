export {
  bfsShortestPath,
  bfsShortestPathAsync,
  type BfsSearchOptions,
} from '@/domains/lesson-engine/lessonCore/bfsSearch';
export {
  clearAllLessonDemoCaches,
  createDemoCache,
  registerLessonDemoCache,
  type DemoCache,
} from '@/domains/lesson-engine/lessonCore/demoCache';
export { normalizeLessonDemoMovesInStep } from '@/domains/lesson-engine/lessonCore/normalizeDemoStep';
export { stepHasDemoMoves } from '@/domains/lesson-engine/lessonCore/stepDemoMoves';
export {
  lessonStepHasDemo,
  pickBestPermuteInTier,
  slotsGainedAfterDemo,
  type PermuteCandidate,
} from '@/domains/lesson-engine/lessonCore/permuteScoring';
export {
  simulateLessonOnStorageCube,
  type SimulateLessonOnStorageCubeOptions,
  type SimulateLessonOnStorageCubeResult,
  type SimulateLessonStep,
} from '@/domains/lesson-engine/lessonCore/simulateLesson';
export { demoChangesState } from '@/domains/lesson-engine/lessonCore/demoChangesState';
export {
  findVerifiedDemoWithTiers,
  findVerifiedDemoWithTiersAsync,
  type FindVerifiedDemoAsyncOptions,
  type FindVerifiedDemoOptions,
  type VerifiedDemoSearchTier,
} from '@/domains/lesson-engine/lessonCore/verifiedDemoFinder';
