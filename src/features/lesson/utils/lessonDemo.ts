import type { Move } from '@/domains/cube/cubeState';
import type { DemoStep, Instruction } from '@/domains/lesson-engine/studentHold/index';

export type DemoSnapshot = {
  moves: Move[];
  demoSteps: DemoStep[];
  instructions: Instruction[];
  demoKey: string;
};

/** Which demo preview to show while the lesson step is pending, ready, or stuck without a demo. */
export function resolveVisibleDemo(args: {
  isLessonComplete: boolean;
  isStepPending: boolean;
  demoMovesLength: number;
  currentDemo: DemoSnapshot | null;
  cachedDemo: DemoSnapshot | null;
}): DemoSnapshot | null {
  if (args.isLessonComplete) return null;
  if (!args.isStepPending && args.demoMovesLength > 0) return args.currentDemo;
  if (args.isStepPending) return args.cachedDemo;
  return null;
}
