import type { CubeState } from '@/domains/cube/cubeState';
import { faceCentersFromCubeState } from '@/domains/cube/cubeState';
import { lastLayerSteps } from '@/content/beginner/lastLayer';
import {
  formatHoldFaceLabel,
  returnToBlueY,
  type CornerHoldIndex,
} from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
import { recognizePermuteEdgesCase } from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/permuteEdgesCases';
import { PERMUTE_EDGES_ALG } from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/permuteEdgesAlgs';
import {
  holdIndexFromFrontColor,
  isPairAtBackRight,
  findReorientToPlacePairAtWorldBackRight,
  reorientMovesForPermuteSetup,
} from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/permuteHold';
import { permutedEdgeSlots } from '@/domains/lesson-engine/layers/lastLayer/permuteEdges/uLayerEdgePermuteModel';
import type { LastLayerLessonStep, LastLayerLessonStepOptions } from '@/domains/lesson-engine/layers/lastLayer/types';

function completeStep(): LastLayerLessonStep {
  return {
    kind: 'complete',
    title: lastLayerSteps.lastLayerEdgesComplete.title,
    body: lastLayerSteps.lastLayerEdgesComplete.body,
  };
}

function buildReturnToBlueStep(
  currentHoldIndex: CornerHoldIndex,
): LastLayerLessonStep {
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceBlueEdges.title,
    body: lastLayerSteps.faceBlueEdges.body,
    practiceGoalSummary: lastLayerSteps.faceBlueEdgesSummary,
    demoMoves: returnToBlueY(currentHoldIndex),
    targetHoldIndex: 0,
    returnToInitialHold: true,
  };
}

function buildReorientForPermuteStep(
  studentState: CubeState,
  targetHoldIndex: CornerHoldIndex,
  options?: { syncHoldOnly?: boolean },
): LastLayerLessonStep {
  const physicalHold = holdIndexFromFrontColor(
    faceCentersFromCubeState(studentState).F,
  );
  const faceLabel = formatHoldFaceLabel(targetHoldIndex);
  return {
    kind: 'reorient-hold',
    title: lastLayerSteps.faceSideTitle(faceLabel),
    body: lastLayerSteps.reorientEdges(faceLabel),
    practiceGoalSummary: lastLayerSteps.reorientEdgesSummary(faceLabel),
    demoMoves: options?.syncHoldOnly
      ? []
      : reorientMovesForPermuteSetup(physicalHold, targetHoldIndex),
    targetHoldIndex,
  };
}

function buildPermuteEdgesStep(
  permuteCase: 'adjacent' | 'opposite',
): LastLayerLessonStep {
  const caseNote =
    permuteCase === 'adjacent'
      ? lastLayerSteps.permuteEdgesAdjacentNote
      : lastLayerSteps.permuteEdgesOppositeNote;
  return {
    kind: 'permute-edges',
    title: lastLayerSteps.permuteTopEdges.title,
    body: lastLayerSteps.permuteTopEdges.body(caseNote),
    practiceGoalSummary: lastLayerSteps.permuteTopEdgesSummary,
    demoMoves: PERMUTE_EDGES_ALG,
    permuteCase,
  };
}

export function computePermuteEdgesStep(
  studentState: CubeState,
  options: LastLayerLessonStepOptions = {},
): LastLayerLessonStep {
  const currentHoldIndex = (options.currentHoldIndex ?? 0) as CornerHoldIndex;
  const frontColor = faceCentersFromCubeState(studentState).F;
  const physicalHold = holdIndexFromFrontColor(frontColor);
  const permuteCase = recognizePermuteEdgesCase(studentState, physicalHold);

  if (permuteCase.kind === 'solved') {
    if (currentHoldIndex !== 0) {
      return buildReturnToBlueStep(currentHoldIndex);
    }
    return completeStep();
  }

  if (permuteCase.kind === 'u-only') {
    if (permuteCase.alignMoves.length === 0) {
      if (currentHoldIndex !== 0) {
        return buildReturnToBlueStep(currentHoldIndex);
      }
      return completeStep();
    }
    return {
      kind: 'align-u',
      subLesson: 'permute-edges',
      title: lastLayerSteps.alignTopLayer.title,
      body: lastLayerSteps.alignTopLayer.body,
      practiceGoalSummary: lastLayerSteps.alignTopLayerSummary,
      demoMoves: permuteCase.alignMoves,
    };
  }

  if (permuteCase.inspectPrefix.length > 0) {
    const visible = permutedEdgeSlots(studentState);
    if (visible.length !== 2) {
      return {
        kind: 'align-u',
        subLesson: 'permute-edges',
        title: lastLayerSteps.inspectTopLayer.title,
        body: lastLayerSteps.inspectTopLayer.body,
        practiceGoalSummary: lastLayerSteps.inspectTopLayerSummary,
        demoMoves: permuteCase.inspectPrefix,
      };
    }
  }

  if (permuteCase.kind === 'adjacent') {
    if (currentHoldIndex !== physicalHold) {
      return buildReorientForPermuteStep(studentState, physicalHold, {
        syncHoldOnly: true,
      });
    }

    if (isPairAtBackRight(permuteCase.slots)) {
      return buildPermuteEdgesStep('adjacent');
    }

    const setup = findReorientToPlacePairAtWorldBackRight(
      studentState,
      physicalHold,
    );
    if (setup && setup.demoMoves.length > 0) {
      return buildReorientForPermuteStep(
        studentState,
        setup.targetHoldIndex,
      );
    }

    return buildReorientForPermuteStep(
      studentState,
      permuteCase.targetHoldIndex,
    );
  }

  return buildPermuteEdgesStep('opposite');
}
