import type { Move } from '@/domains/cube/cubeState';
import { getMoveText, getRotationText } from '@/domains/lesson-engine/studentHold/copy';
import { expandDemoSteps, type RotationPurpose } from '@/domains/lesson-engine/studentHold/expandDemoSteps';
import { holdAfterRotation } from '@/domains/lesson-engine/studentHold/composeY';
import type {
  AvoidBackPrefs,
  ExpandDemoResult,
  Instruction,
  StudentHold,
} from '@/domains/lesson-engine/studentHold/types';
import { noneHold } from '@/domains/lesson-engine/studentHold/types';

export function expandDemoToInstructions(
  rawMoves: Move[],
  initialHold: StudentHold = noneHold(),
  prefs: AvoidBackPrefs = { avoidBackMoves: false },
): ExpandDemoResult {
  const { steps, finalHold } = expandDemoSteps(
    rawMoves,
    initialHold,
    prefs.avoidBackMoves,
  );
  let hold = initialHold;
  const instructions: Instruction[] = [];

  for (const step of steps) {
    if (step.type === 'rotation') {
      instructions.push({
        type: 'rotation',
        rotation: step.rotation,
        text: getRotationText(
          step.rotation,
          step.purpose as RotationPurpose | undefined,
        ),
      });
      hold = holdAfterRotation(hold, step.rotation);
    } else {
      instructions.push({
        type: 'move',
        move: step.move,
        text: getMoveText(step.move, hold),
      });
    }
  }

  return { instructions, finalHold };
}
