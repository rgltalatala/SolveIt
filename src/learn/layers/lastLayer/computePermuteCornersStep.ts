import type { CubeState, Move } from '../../../cube/cubeState';
import { lastLayerSteps } from '../../../content/lastLayer';
import {
  formatHoldFaceLabel,
  returnToBlueY,
  type CornerHoldIndex,
} from '../bottomLayer/corners/cornerHold';
import { recognizePermuteCornersCase } from './permuteCorners/permuteCornersCases';
import { PERMUTE_CORNERS_ALG } from './permuteCorners/permuteCornersAlgs';
import {
  findReorientToPlacePermutedCornerAtWorldUrf,
  WORLD_URF_SLOT,
} from './permuteCorners/permuteHold';
import { cornerPermutedAtSlot } from './permuteCorners/uLayerCornerPermuteModel';
import type {
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
  PermuteCornersCaseKind,
} from './types';

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceBlueCorners.title,
    body: lastLayerSteps.faceBlueCorners.body,
    practiceGoalSummary: lastLayerSteps.faceBlueCornersSummary,
    demoMoves: returnToBlueY(currentHoldIndex),
    targetHoldIndex: 0,
    returnToInitialHold: true,
  };
}

function buildReorientForCornerStep(
  targetHoldIndex: CornerHoldIndex,
  demoMoves: Move[],
): LastLayerLessonStep {
  const faceLabel = formatHoldFaceLabel(targetHoldIndex);
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceSideTitle(faceLabel),
    body: lastLayerSteps.reorientCorners(faceLabel),
    practiceGoalSummary: lastLayerSteps.reorientCornersSummary(faceLabel),
    demoMoves,
    targetHoldIndex,
  };
}

function buildPermuteCornersStep(
  permuteCase: PermuteCornersCaseKind,
): LastLayerLessonStep {
  if (permuteCase === 'zero-flow-first') {
    return {
      kind: 'permute-corners',
      title: lastLayerSteps.permuteCornersZeroFlowFirst.title,
      body: lastLayerSteps.permuteCornersZeroFlowFirst.body,
      practiceGoalSummary: lastLayerSteps.permuteCornersZeroFlowFirstSummary,
      demoMoves: PERMUTE_CORNERS_ALG,
      permuteCase,
    };
  }

  return {
    kind: 'permute-corners',
    title: lastLayerSteps.permuteCornersOne.title,
    body: lastLayerSteps.permuteCornersOne.body,
    practiceGoalSummary: lastLayerSteps.permuteCornersOneSummary,
    demoMoves: PERMUTE_CORNERS_ALG,
    permuteCase,
  };
}

export function computePermuteCornersStep(
  studentState: CubeState,
  options: LastLayerLessonStepOptions = {},
): LastLayerLessonStep {
  const currentHoldIndex = (options.currentHoldIndex ?? 0) as CornerHoldIndex;

  const permuteCase = recognizePermuteCornersCase(
    studentState,
    currentHoldIndex,
  );

  if (permuteCase.kind === 'solved') {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    throw new Error(
      'computePermuteCornersStep: corners permuted at blue hold should route to orient',
    );
  }

  if (permuteCase.kind === 'none-permuted') {
    return buildPermuteCornersStep('zero-flow-first');
  }

  if (!cornerPermutedAtSlot(studentState, WORLD_URF_SLOT)) {
    const setup = findReorientToPlacePermutedCornerAtWorldUrf(
      studentState,
      currentHoldIndex,
    );
    if (setup && setup.demoMoves.length > 0) {
      return buildReorientForCornerStep(
        setup.targetHoldIndex,
        setup.demoMoves,
      );
    }
  }

  return buildPermuteCornersStep('one-permuted');
}
