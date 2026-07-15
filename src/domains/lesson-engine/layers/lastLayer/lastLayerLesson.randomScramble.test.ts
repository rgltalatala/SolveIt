import { describe, expect, it } from 'vitest';
import { randomScrambleForEvent } from 'cubing/scramble';
import {
  applyMoves,
  cloneCubeState,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type CubeState,
} from '@/domains/cube/cubeState';
import { parseFaceTurnAlgToMoves } from '@/domains/cube/parseFaceTurnAlg';
import { validateCubeState } from '@/domains/cube/cubeValidator';
import { simulateWhiteCornersLessonOnStorageCube } from '@/domains/lesson-engine/layers/bottomLayer/corners/index';
import { simulateWhiteCrossLessonOnStorageCube } from '@/domains/lesson-engine/layers/bottomLayer/cross/index';
import type { CornerHoldIndex } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
import { normalizeHoldToBlue } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
import {
  getMiddleLayerEdgeLessonStep,
  isMiddleLayerEdgesComplete,
  isMiddleLayerLessonStateValid,
  MIDDLE_EDGE_SLOTS,
  simulateMiddleLayerEdgesLessonOnStorageCube,
} from '@/domains/lesson-engine/layers/middleLayer/edges/index';
import {
  edgeSlotSolved,
  slotIdForExpectedEdgeColors,
} from '@/domains/lesson-engine/layers/middleLayer/edges/edgeSlotModel';
import type { MiddleEdgeSlotId } from '@/domains/lesson-engine/layers/middleLayer/edges/types';
import {
  getLastLayerLessonStep,
  isCornersFullyPermuted,
  isEdgesFullyPermuted,
  isLastLayerComplete,
  isLastLayerLessonStateValid,
  isYellowCrossComplete,
  type LastLayerLessonStep,
  type LastLayerSubLesson,
  type SeenLastLayerIntros,
} from '@/domains/lesson-engine/layers/lastLayer/index';
import { markLastLayerIntroSeen } from '@/domains/lesson-engine/layers/lastLayer/introSteps';

type SimulationSession = {
  currentHoldIndex: CornerHoldIndex;
  inOrientCornersPhase?: boolean;
  seenIntros: SeenLastLayerIntros;
  hasAcknowledgedOrientEdgesComplete?: boolean;
};

type PhaseMilestones = Record<LastLayerSubLesson, boolean>;

type LastLayerSimResult = {
  stuckNoDemo: boolean;
  lastLayerComplete: boolean;
  lastStepKind?: LastLayerLessonStep['kind'];
  stepsSimulated: number;
  milestones: PhaseMilestones;
  student: CubeState;
  session: SimulationSession;
};

function emptyMilestones(): PhaseMilestones {
  return {
    'orient-edges': false,
    'permute-edges': false,
    'permute-corners': false,
    'orient-corners': false,
  };
}

function markOrientCornersPhase(
  step: LastLayerLessonStep,
  session: SimulationSession,
): void {
  if (
    step.kind === 'orient-corners' ||
    (step.kind === 'align-u' && step.subLesson === 'orient-corners')
  ) {
    session.inOrientCornersPhase = true;
  }
}

function advanceSessionAfterStep(
  step: LastLayerLessonStep,
  session: SimulationSession,
): SimulationSession {
  let hold = session.currentHoldIndex;
  if (step.kind === 'reorient-hold') {
    if (step.returnToInitialHold) hold = 0;
    else if (step.targetHoldIndex !== undefined) {
      hold = step.targetHoldIndex as CornerHoldIndex;
    }
  }

  return {
    currentHoldIndex: hold,
    inOrientCornersPhase: session.inOrientCornersPhase,
    seenIntros: session.seenIntros,
    hasAcknowledgedOrientEdgesComplete:
      session.hasAcknowledgedOrientEdgesComplete ||
      step.kind === 'orient-edges-already-complete',
  };
}

function stepBelongsToSubLesson(
  step: LastLayerLessonStep,
  subLesson: LastLayerSubLesson,
): boolean {
  switch (subLesson) {
    case 'orient-edges':
      return (
        step.kind === 'orient-edges' ||
        step.kind === 'orient-edges-already-complete' ||
        (step.kind === 'align-u' && step.subLesson === 'orient-edges')
      );
    case 'permute-edges':
      return (
        step.kind === 'permute-edges' ||
        (step.kind === 'align-u' && step.subLesson === 'permute-edges') ||
        (step.kind === 'reorient-hold' && !step.returnToInitialHold)
      );
    case 'permute-corners':
      return step.kind === 'permute-corners';
    case 'orient-corners':
      return (
        step.kind === 'orient-corners' ||
        (step.kind === 'align-u' && step.subLesson === 'orient-corners') ||
        (step.kind === 'reorient-hold' && step.returnToInitialHold === true)
      );
    default:
      return false;
  }
}

function updateMilestones(
  milestones: PhaseMilestones,
  step: LastLayerLessonStep,
): void {
  for (const subLesson of [
    'orient-edges',
    'permute-edges',
    'permute-corners',
    'orient-corners',
  ] as const) {
    if (stepBelongsToSubLesson(step, subLesson)) {
      milestones[subLesson] = true;
    }
  }
}

function isLastLayerLessonComplete(
  student: CubeState,
  hold: CornerHoldIndex,
): boolean {
  return isLastLayerComplete(student) && hold === 0;
}

function simulateLastLayerLesson(
  studentFrame: CubeState,
  maxSteps = 96,
): LastLayerSimResult {
  let session: SimulationSession = { currentHoldIndex: 0, seenIntros: {} };
  let student = cloneCubeState(studentFrame);
  const milestones = emptyMilestones();
  let stepsSimulated = 0;
  let lastStepKind: LastLayerLessonStep['kind'] | undefined;

  for (let i = 0; i < maxSteps; i += 1) {
    if (isLastLayerLessonComplete(student, session.currentHoldIndex)) {
      return {
        stuckNoDemo: false,
        lastLayerComplete: true,
        lastStepKind: 'complete',
        stepsSimulated,
        milestones,
        student,
        session,
      };
    }

    const step = getLastLayerLessonStep(student, session);
    lastStepKind = step.kind;
    markOrientCornersPhase(step, session);
    updateMilestones(milestones, step);

    if (step.kind === 'complete') {
      return {
        stuckNoDemo: false,
        lastLayerComplete: true,
        lastStepKind,
        stepsSimulated,
        milestones,
        student,
        session,
      };
    }

    if (step.kind === 'prerequisite') {
      return {
        stuckNoDemo: true,
        lastLayerComplete: false,
        lastStepKind,
        stepsSimulated,
        milestones,
        student,
        session,
      };
    }

    if (step.kind === 'intro') {
      session = {
        ...session,
        seenIntros: markLastLayerIntroSeen(session.seenIntros, step.introId),
      };
      continue;
    }

    if (step.kind === 'orient-edges-already-complete') {
      session = {
        ...session,
        hasAcknowledgedOrientEdgesComplete: true,
      };
      continue;
    }

    if (!('demoMoves' in step) || !step.demoMoves?.length) {
      return {
        stuckNoDemo: true,
        lastLayerComplete: isLastLayerComplete(student),
        lastStepKind,
        stepsSimulated,
        milestones,
        student,
        session,
      };
    }

    student = applyMoves(student, step.demoMoves);
    session = advanceSessionAfterStep(step, session);
    stepsSimulated += 1;
  }

  const lastLayerComplete = isLastLayerLessonComplete(
    student,
    session.currentHoldIndex,
  );
  return {
    stuckNoDemo: !lastLayerComplete,
    lastLayerComplete,
    lastStepKind,
    stepsSimulated,
    milestones,
    student,
    session,
  };
}

function middleLayerCompleteStudent(
  studentFrame: CubeState,
  maxSteps = 250,
): CubeState {
  let currentHoldIndex: CornerHoldIndex = 0;
  let hasSeenStrategyIntro = false;
  let student = cloneCubeState(studentFrame);
  const normalized = normalizeHoldToBlue(student, 0);
  const solvedMiddleEdgeSlots: MiddleEdgeSlotId[] = MIDDLE_EDGE_SLOTS.filter(
    (id) => edgeSlotSolved(normalized, id),
  );

  for (let i = 0; i < maxSteps; i += 1) {
    if (
      isMiddleLayerEdgesComplete(student, currentHoldIndex) &&
      currentHoldIndex === 0
    ) {
      return student;
    }

    const step = getMiddleLayerEdgeLessonStep(student, {
      currentHoldIndex,
      solvedMiddleEdgeSlots,
      hasSeenStrategyIntro,
    });
    if (step.kind === 'complete') return student;
    if (step.kind === 'intro') {
      hasSeenStrategyIntro = true;
      continue;
    }
    if (step.kind === 'cross-corners-prerequisite' || !step.demoMoves?.length) {
      return student;
    }

    student = applyMoves(student, step.demoMoves);
    if (step.kind === 'reorient-hold') {
      if (step.returnToInitialHold) currentHoldIndex = 0;
      else if (step.targetHoldIndex !== undefined) {
        currentHoldIndex = step.targetHoldIndex as CornerHoldIndex;
      }
    } else if (step.kind === 'solve-edge' && step.action === 'insert') {
      const slotId = slotIdForExpectedEdgeColors(
        student,
        step.edgeColors,
        currentHoldIndex,
      );
      if (slotId && !solvedMiddleEdgeSlots.includes(slotId)) {
        solvedMiddleEdgeSlots.push(slotId);
      }
    }
  }

  return student;
}

async function f2lCompleteStudentFromRandomScramble(): Promise<{
  algStr: string;
  student: CubeState;
}> {
  const alg = await randomScrambleForEvent('333');
  const algStr = alg.toString().replace(/\u2032/g, "'");
  const moves = parseFaceTurnAlgToMoves(algStr);
  const storage = applyMoves(createSolvedCubeState(), moves);
  const v = validateCubeState(storage);
  expect(
    v.valid,
    `cube invalid: ${v.issues.map((x) => x.message).join('; ')}`,
  ).toBe(true);

  const crossRes = simulateWhiteCrossLessonOnStorageCube(storage, 150);
  expect(crossRes.stuckNoDemo, `cross stuck alg=${algStr}`).toBe(false);
  expect(crossRes.crossComplete, `cross incomplete alg=${algStr}`).toBe(true);

  const cornersRes = simulateWhiteCornersLessonOnStorageCube(
    crossRes.finalStorageCube,
    150,
  );
  expect(cornersRes.stuckNoDemo, `corners stuck alg=${algStr}`).toBe(false);
  expect(cornersRes.cornersComplete, `corners incomplete alg=${algStr}`).toBe(
    true,
  );
  expect(cornersRes.finalStorageCube).toBeDefined();

  const student = cubeStateToStudentFrame(cornersRes.finalStorageCube!);
  expect(
    isMiddleLayerLessonStateValid(student),
    `bottom layer invalid alg=${algStr}`,
  ).toBe(true);

  const middleRes = simulateMiddleLayerEdgesLessonOnStorageCube(student, 250);
  expect(middleRes.stuckNoDemo, `middle stuck alg=${algStr}`).toBe(false);
  expect(middleRes.middleLayerComplete, `middle incomplete alg=${algStr}`).toBe(
    true,
  );
  expect(middleRes.finalHoldIndex).toBe(0);

  const f2lComplete = middleLayerCompleteStudent(student);
  expect(
    isLastLayerLessonStateValid(f2lComplete),
    `last-layer entry invalid alg=${algStr}`,
  ).toBe(true);

  return { algStr, student: f2lComplete };
}

describe('last layer orient-edges vs random scrambles', () => {
  it('completes yellow cross from F2L-ready random WCA scrambles', async () => {
    for (let i = 0; i < 8; i += 1) {
      const { algStr, student } = await f2lCompleteStudentFromRandomScramble();
      const res = simulateLastLayerLesson(student);
      expect(res.stuckNoDemo, `stuck iter ${i} alg=${algStr}`).toBe(false);
      expect(res.lastLayerComplete, `incomplete iter ${i} alg=${algStr}`).toBe(
        true,
      );
      expect(
        isYellowCrossComplete(student) || res.milestones['orient-edges'],
        algStr,
      ).toBe(true);
    }
  }, 180_000);
});

describe('last layer permute-edges vs random scrambles', () => {
  it('fully permutes U-layer edges after yellow cross on random WCA scrambles', async () => {
    for (let i = 0; i < 8; i += 1) {
      const { algStr, student } = await f2lCompleteStudentFromRandomScramble();
      const res = simulateLastLayerLesson(student);
      expect(res.stuckNoDemo, `stuck iter ${i} alg=${algStr}`).toBe(false);
      expect(res.lastLayerComplete, `incomplete iter ${i} alg=${algStr}`).toBe(
        true,
      );
      expect(
        isEdgesFullyPermuted(res.student) || res.milestones['permute-edges'],
        algStr,
      ).toBe(true);
    }
  }, 180_000);
});

describe('last layer permute-corners vs random scrambles', () => {
  it('fully permutes U-layer corners after edge permute on random WCA scrambles', async () => {
    for (let i = 0; i < 8; i += 1) {
      const { algStr, student } = await f2lCompleteStudentFromRandomScramble();
      const res = simulateLastLayerLesson(student);
      expect(res.stuckNoDemo, `stuck iter ${i} alg=${algStr}`).toBe(false);
      expect(res.lastLayerComplete, `incomplete iter ${i} alg=${algStr}`).toBe(
        true,
      );
      expect(
        isCornersFullyPermuted(res.student) ||
          res.milestones['permute-corners'],
        algStr,
      ).toBe(true);
    }
  }, 180_000);
});

describe('last layer orient-corners vs random scrambles', () => {
  it('orients all corners and restores F2L on random WCA scrambles', async () => {
    for (let i = 0; i < 8; i += 1) {
      const { algStr, student } = await f2lCompleteStudentFromRandomScramble();
      const res = simulateLastLayerLesson(student);
      expect(res.stuckNoDemo, `stuck iter ${i} alg=${algStr}`).toBe(false);
      expect(res.lastLayerComplete, `incomplete iter ${i} alg=${algStr}`).toBe(
        true,
      );
      expect(res.session.currentHoldIndex, algStr).toBe(0);
      expect(
        isLastLayerLessonStateValid(res.student),
        `F2L not restored iter ${i} alg=${algStr}`,
      ).toBe(true);
      expect(
        res.milestones['orient-corners'] || isLastLayerComplete(student),
        algStr,
      ).toBe(true);
    }
  }, 180_000);
});

describe('last layer full lesson vs random scrambles', () => {
  it('completes all four sub-lessons from F2L-ready random WCA scrambles', async () => {
    for (let i = 0; i < 8; i += 1) {
      const { algStr, student } = await f2lCompleteStudentFromRandomScramble();
      const res = simulateLastLayerLesson(student);
      expect(
        res.stuckNoDemo,
        `stuck iter ${i}, lastKind=${res.lastStepKind} alg=${algStr}`,
      ).toBe(false);
      expect(
        res.lastLayerComplete,
        `incomplete iter ${i}, steps=${res.stepsSimulated} alg=${algStr}`,
      ).toBe(true);
      expect(res.session.currentHoldIndex, algStr).toBe(0);
      expect(isLastLayerLessonStateValid(res.student), algStr).toBe(true);
    }
  }, 180_000);
});
