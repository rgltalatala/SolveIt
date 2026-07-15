import type { Color, Move } from '@/domains/cube/cubeState';
import type { CornerHoldIndex } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';

export const MIDDLE_EDGE_SLOTS = ['FR', 'FL', 'BR', 'BL'] as const;

export type MiddleEdgeSlotId = (typeof MIDDLE_EDGE_SLOTS)[number];

export const MIDDLE_LAYER_EDGES_STEP_KINDS = [
  'intro',
  'complete',
  'cross-corners-prerequisite',
  'reorient-hold',
  'align-u',
  'solve-edge',
] as const;

export type MiddleLayerEdgesStepKind =
  (typeof MIDDLE_LAYER_EDGES_STEP_KINDS)[number];

export type MiddleLayerEdgesLessonStep =
  | {
      kind: 'intro';
      title: string;
      body: string;
      practiceGoalSummary?: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'complete';
      title: string;
      body: string;
      practiceGoalSummary?: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'cross-corners-prerequisite';
      title: string;
      body: string;
      practiceGoalSummary?: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'reorient-hold';
      title: string;
      body: string;
      practiceGoalSummary?: string;
      demoMoves: Move[];
      targetHoldIndex?: CornerHoldIndex;
      returnToInitialHold?: boolean;
    }
  | {
      kind: 'align-u';
      title: string;
      body: string;
      practiceGoalSummary?: string;
      demoMoves: Move[];
      edgeColors: [Color, Color];
    }
  | {
      kind: 'solve-edge';
      title: string;
      body: string;
      practiceGoalSummary?: string;
      demoMoves: Move[];
      edgeColors: [Color, Color];
      action: 'insert' | 'extract';
      slot: 'FL' | 'FR';
    };

export interface MiddleLayerEdgeLessonStepOptions {
  currentHoldIndex?: CornerHoldIndex;
  solvedMiddleEdgeSlots?: readonly MiddleEdgeSlotId[];
  /** Strategy intro shown once per lesson session before the first edge solve. */
  hasSeenStrategyIntro?: boolean;
}

export interface SimulateMiddleLayerEdgesLessonResult {
  lessonStepsSimulated: number;
  middleLayerComplete: boolean;
  lastStepKind?: MiddleLayerEdgesLessonStep['kind'];
  stuckNoDemo: boolean;
  finalHoldIndex?: number;
}
