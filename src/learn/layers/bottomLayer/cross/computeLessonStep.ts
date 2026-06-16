import type { CubeState } from '../../../../cube/cubeState';
import { normalizeLessonDemoMovesInStep } from '../../../lessonCore';
import { isWhiteCrossComplete } from './crossSlotModel';
import {
  planTargetEdgeStep,
  planTargetEdgeStepAsync,
  stuckPartnerStep,
} from './planTargetEdgeStep';
import type { WhiteCrossLessonStep } from './types';

const WHITE_CROSS_COMPLETE_BODY =
  'All four white edges line up with their side centers on the bottom face. Confirm your physical cube matches the diagram below (same hold: white on bottom, yellow on top). Use Back to cube overview when you are ready to leave.';

function whiteCrossCompleteStep(): WhiteCrossLessonStep {
  return {
    kind: 'complete',
    title: 'White cross complete',
    body: WHITE_CROSS_COMPLETE_BODY,
  };
}

function computeWhiteCrossLessonStepSync(
  studentState: CubeState,
): WhiteCrossLessonStep {
  if (isWhiteCrossComplete(studentState)) {
    return whiteCrossCompleteStep();
  }

  return planTargetEdgeStep(studentState) ?? stuckPartnerStep(studentState);
}

async function computeWhiteCrossLessonStepAsync(
  studentState: CubeState,
): Promise<WhiteCrossLessonStep> {
  if (isWhiteCrossComplete(studentState)) {
    return whiteCrossCompleteStep();
  }

  return (
    (await planTargetEdgeStepAsync(studentState)) ??
    stuckPartnerStep(studentState)
  );
}

export function getWhiteCrossLessonStep(
  studentState: CubeState,
): WhiteCrossLessonStep {
  return normalizeLessonDemoMovesInStep(
    computeWhiteCrossLessonStepSync(studentState),
  );
}

/** UI path: BFS yields to the main thread so apply/loading stay responsive. */
export async function getWhiteCrossLessonStepAsync(
  studentState: CubeState,
): Promise<WhiteCrossLessonStep> {
  return normalizeLessonDemoMovesInStep(
    await computeWhiteCrossLessonStepAsync(studentState),
  );
}
