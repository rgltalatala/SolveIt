export type {
  AvoidBackPrefs,
  BuildExecutionResult,
  ExpandDemoResult,
  Instruction,
  StudentHold,
  YHold,
  YRotationStep,
} from '@/domains/lesson-engine/studentHold/types';
export { noneHold } from '@/domains/lesson-engine/studentHold/types';

export { isBackFaceMove, needsReorientForBack } from '@/domains/lesson-engine/studentHold/backFace';
export { composeY, holdAfterRotation } from '@/domains/lesson-engine/studentHold/composeY';
export {
  centersForHold,
  getDemoStepChipLabel,
  getMoveText,
  getRotationText,
  type RotationCopyPurpose,
} from '@/domains/lesson-engine/studentHold/copy';
export {
  demoStepsToMoves,
  expandDemoSteps,
  type DemoStep,
  type RotationPurpose,
} from '@/domains/lesson-engine/studentHold/expandDemoSteps';
export { buildExecutionMoves } from '@/domains/lesson-engine/studentHold/executionMoves';
export { expandDemoToInstructions } from '@/domains/lesson-engine/studentHold/expandInstructions';
export {
  applyLessonToStorage,
  getLessonDemoExpansion,
  getLessonExecutionMoves,
  type ApplyLessonToStorageResult,
} from '@/domains/lesson-engine/studentHold/lessonExecution';
export {
  FACE_MAP,
  getFaceFromMove,
  getModifierFromMove,
  translateMove,
} from '@/domains/lesson-engine/studentHold/translateMove';
