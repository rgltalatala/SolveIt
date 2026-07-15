import type { Move } from '@/domains/cube/cubeState';
import { getLessonExecutionMoves } from '@/domains/lesson-engine/studentHold/lessonExecution';
import type {
  AvoidBackPrefs,
  BuildExecutionResult,
  StudentHold,
} from '@/domains/lesson-engine/studentHold/types';
import { noneHold } from '@/domains/lesson-engine/studentHold/types';

/** Wrapper for callers that already have {@link AvoidBackPrefs}. */
export function buildExecutionMoves(
  rawMoves: Move[],
  prefs: AvoidBackPrefs,
  initialHold: StudentHold = noneHold(),
): BuildExecutionResult {
  return getLessonExecutionMoves(rawMoves, prefs.avoidBackMoves, initialHold);
}
