import type { CubeState } from '@/domains/cube/cubeState';
import { isWhiteCrossComplete } from '@/domains/lesson-engine/layers/bottomLayer/cross/crossSlotModel';
import { isWhiteCornersComplete } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerSlotModel';
import { isMiddleLayerEdgesComplete } from '@/domains/lesson-engine/layers/middleLayer/edges/edgeSlotModel';
import { computeOrientCornersStep, lastLayerCompleteStep } from '@/domains/lesson-engine/layers/lastLayer/computeOrientCornersStep';
import { computeOrientEdgesStep, buildOrientEdgesAlreadyCompleteStep } from '@/domains/lesson-engine/layers/lastLayer/computeOrientEdgesStep';
import { computePermuteCornersStep } from '@/domains/lesson-engine/layers/lastLayer/computePermuteCornersStep';
import { computePermuteEdgesStep } from '@/domains/lesson-engine/layers/lastLayer/computePermuteEdgesStep';
import { isYellowCrossComplete } from '@/domains/lesson-engine/layers/lastLayer/orientEdges/uLayerEdgeModel';
import { isEdgesFullyPermuted } from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/uLayerEdgePermuteModel';
import {
  isCornersFullyPermuted,
  isLastLayerComplete,
} from '@/domains/lesson-engine/layers/lastLayer/permuteCorners/uLayerCornerPermuteModel';
import type {
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
} from '@/domains/lesson-engine/layers/lastLayer/types';
import { lastLayerSteps } from '@/content/beginner/lastLayer';
import {
  maybeLastLayerIntro,
} from '@/domains/lesson-engine/layers/lastLayer/introSteps';

const PREREQUISITE_BODY = lastLayerSteps.prerequisite.body;

function prerequisiteStep(): LastLayerLessonStep {
  return {
    kind: 'prerequisite',
    title: lastLayerSteps.prerequisite.title,
    body: PREREQUISITE_BODY,
  };
}

function isPrerequisiteIncomplete(studentState: CubeState): boolean {
  return (
    !isWhiteCrossComplete(studentState) ||
    !isWhiteCornersComplete(studentState) ||
    !isMiddleLayerEdgesComplete(studentState, 0)
  );
}

/** Orient-corners may temporarily disturb F2L; skip that gate once the sub-lesson has started. */
export function isOrientCornersPhase(
  studentState: CubeState,
  options: LastLayerLessonStepOptions,
): boolean {
  if (options.inOrientCornersPhase) return true;
  return (
    isYellowCrossComplete(studentState) &&
    isEdgesFullyPermuted(studentState) &&
    isCornersFullyPermuted(studentState) &&
    !isLastLayerComplete(studentState)
  );
}

function computeLastLayerLessonStep(
  studentState: CubeState,
  options: LastLayerLessonStepOptions = {},
): LastLayerLessonStep {
  if (
    !isOrientCornersPhase(studentState, options) &&
    isPrerequisiteIncomplete(studentState)
  ) {
    return prerequisiteStep();
  }

  if (isLastLayerComplete(studentState)) {
    if ((options.currentHoldIndex ?? 0) !== 0) {
      return computeOrientCornersStep(studentState, options);
    }
    return lastLayerCompleteStep();
  }

  const overviewIntro = maybeLastLayerIntro(options, 'overview');
  if (overviewIntro) return overviewIntro;

  if (!isYellowCrossComplete(studentState)) {
    const intro = maybeLastLayerIntro(options, 'orient-edges');
    if (intro) return intro;
    return computeOrientEdgesStep(studentState);
  }

  if (!options.hasAcknowledgedOrientEdgesComplete) {
    const intro = maybeLastLayerIntro(options, 'orient-edges');
    if (intro) return intro;
    return buildOrientEdgesAlreadyCompleteStep();
  }

  if (
    options.inOrientCornersPhase &&
    !isLastLayerComplete(studentState)
  ) {
    const intro = maybeLastLayerIntro(options, 'orient-corners');
    if (intro) return intro;
    return computeOrientCornersStep(studentState, options);
  }

  if (!isEdgesFullyPermuted(studentState)) {
    const intro = maybeLastLayerIntro(options, 'permute-edges');
    if (intro) return intro;
    return computePermuteEdgesStep(studentState, options);
  }

  if (!isCornersFullyPermuted(studentState)) {
    const intro = maybeLastLayerIntro(options, 'permute-corners');
    if (intro) return intro;
    return computePermuteCornersStep(studentState, options);
  }

  if (!isLastLayerComplete(studentState)) {
    const intro = maybeLastLayerIntro(options, 'orient-corners');
    if (intro) return intro;
    return computeOrientCornersStep(studentState, options);
  }

  return lastLayerCompleteStep();
}

export function getLastLayerLessonStep(
  studentState: CubeState,
  options?: LastLayerLessonStepOptions,
): LastLayerLessonStep {
  return computeLastLayerLessonStep(studentState, options);
}

export function getLastLayerLessonStepAsync(
  studentState: CubeState,
  options?: LastLayerLessonStepOptions,
): Promise<LastLayerLessonStep> {
  return Promise.resolve(computeLastLayerLessonStep(studentState, options));
}
