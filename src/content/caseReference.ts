import type { Move } from '../cube/cubeState';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type CubeState,
} from '../cube/cubeState';
import { invertMoves } from '../cube/invertMoves';
import {
  FRD_WHITE_ON_F,
  FRD_WHITE_ON_R,
} from '../learn/layers/bottomLayer/corners/directSolveSteps';
import {
  FRD_URF_WHITE_ON_F,
  FRD_URF_WHITE_ON_R,
  FRD_URF_WHITE_ON_U,
} from '../learn/layers/bottomLayer/corners/uLayerSteps';
import { LEFT_INSERT, RIGHT_INSERT } from '../learn/layers/middleLayer/edges/edgeAlgorithms';
import {
  BAR_ALG,
  DOT_ALG,
  L_SHAPE_ALG,
} from '../learn/layers/lastLayer/orientEdges/orientEdgesAlgs';
import { PERMUTE_EDGES_ALG } from '../learn/layers/lastLayer/permuteEdges/permuteEdgesAlgs';
import type { Instruction } from '../learn/studentHold';
import {
  PERMUTE_CORNERS_ALG,
  ZERO_FLOW_NONE_PERMUTED_SETUP,
  ZERO_FLOW_PERMUTE_CORNERS_FULL,
  ZERO_FLOW_PERMUTE_PHASES,
} from '../learn/layers/lastLayer/permuteCorners/permuteCornersAlgs';
import {
  ORIENT_CORNER_ALG,
  repeatOrientAlg,
} from '../learn/layers/lastLayer/orientCorners/orientCornersAlgs';
import { LAST_LAYER_SUB_LESSON_LABELS } from './lastLayer';
import { whiteCornersLesson } from './whiteCorners';
import { middleLayerLesson } from './middleLayer';
import { lastLayerLesson } from './lastLayer';
import type { ActiveLessonId } from '../store/cubeStore';

export type CaseReferenceEntry = {
  id: string;
  group: string;
  title: string;
  alg: string;
  algMoves: readonly Move[];
  setupMoves?: readonly Move[];
};

export type CaseReferenceGroup = {
  heading: string;
  cases: CaseReferenceEntry[];
};

export type CaseReferenceCatalog = {
  lessonId: ActiveLessonId;
  groups: CaseReferenceGroup[];
};

function movesToAlgString(moves: readonly Move[]): string {
  return moves.join(' ');
}

export type CaseReferenceLessonSection = {
  lessonTitle: string;
  groups: CaseReferenceGroup[];
};

function solvedStudent(): CubeState {
  return cubeStateToStudentFrame(createSolvedCubeState());
}

/** Default solved cube for the cases viewer (yellow U, blue F, white D). */
export function solvedStudentFrameCube(): CubeState {
  return solvedStudent();
}

function studentSetupFromMoves(moves: readonly Move[]): CubeState {
  return applyMoves(solvedStudent(), moves);
}

function entry(
  id: string,
  group: string,
  title: string,
  algMoves: readonly Move[],
  setupMoves?: readonly Move[],
): CaseReferenceEntry {
  return {
    id,
    group,
    title,
    alg: movesToAlgString(algMoves),
    algMoves,
    setupMoves,
  };
}

const WHITE_CORNERS_GROUPS: CaseReferenceGroup[] = [
  {
    heading: 'URF (corner on top)',
    cases: [
      entry(
        'white-corners:urf:white-u',
        'URF (corner on top)',
        'White on U',
        FRD_URF_WHITE_ON_U,
        invertMoves(FRD_URF_WHITE_ON_U),
      ),
      entry(
        'white-corners:urf:white-r',
        'URF (corner on top)',
        'White on R',
        FRD_URF_WHITE_ON_R,
        invertMoves(FRD_URF_WHITE_ON_R),
      ),
      entry(
        'white-corners:urf:white-f',
        'URF (corner on top)',
        'White on F',
        FRD_URF_WHITE_ON_F,
        invertMoves(FRD_URF_WHITE_ON_F),
      ),
    ],
  },
  {
    heading: 'FRD (corner in slot, twisted)',
    cases: [
      entry(
        'white-corners:frd:white-f',
        'FRD (corner in slot, twisted)',
        'White on F',
        FRD_WHITE_ON_F,
        invertMoves(FRD_WHITE_ON_F),
      ),
      entry(
        'white-corners:frd:white-r',
        'FRD (corner in slot, twisted)',
        'White on R',
        FRD_WHITE_ON_R,
        invertMoves(FRD_WHITE_ON_R),
      ),
    ],
  },
];

const MIDDLE_LAYER_GROUPS: CaseReferenceGroup[] = [
  {
    heading: 'Front slots',
    cases: [
      entry(
        'middle-layer:left',
        'Front slots',
        'Front-left slot',
        LEFT_INSERT,
        invertMoves(LEFT_INSERT),
      ),
      entry(
        'middle-layer:right',
        'Front slots',
        'Front-right slot',
        RIGHT_INSERT,
        invertMoves(RIGHT_INSERT),
      ),
    ],
  },
];

const LAST_LAYER_GROUPS: CaseReferenceGroup[] = [
  {
    heading: LAST_LAYER_SUB_LESSON_LABELS.orientEdges,
    cases: [
      entry('last-layer:dot', LAST_LAYER_SUB_LESSON_LABELS.orientEdges, 'Dot', DOT_ALG, invertMoves(DOT_ALG)),
      entry('last-layer:l', LAST_LAYER_SUB_LESSON_LABELS.orientEdges, 'L', L_SHAPE_ALG, invertMoves(L_SHAPE_ALG)),
      entry('last-layer:bar', LAST_LAYER_SUB_LESSON_LABELS.orientEdges, 'Bar', BAR_ALG, invertMoves(BAR_ALG)),
    ],
  },
  {
    heading: LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
    cases: [
      entry(
        'last-layer:permute-edges-adjacent',
        LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
        'Adjacent',
        PERMUTE_EDGES_ALG,
        invertMoves(PERMUTE_EDGES_ALG),
      ),
      entry(
        'last-layer:permute-edges-opposite',
        LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
        'Opposite',
        PERMUTE_EDGES_ALG,
        [
          ...PERMUTE_EDGES_ALG,
          'y2',
          ...invertMoves(PERMUTE_EDGES_ALG),
        ],
      ),
    ],
  },
  {
    heading: LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
    cases: [
      entry(
        'last-layer:permute-corners-zero-flow',
        LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
        'Zero-flow',
        ZERO_FLOW_PERMUTE_CORNERS_FULL,
        ZERO_FLOW_NONE_PERMUTED_SETUP,
      ),
      entry(
        'last-layer:permute-corners-one',
        LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
        'One permuted',
        PERMUTE_CORNERS_ALG,
        invertMoves(PERMUTE_CORNERS_ALG),
      ),
    ],
  },
  {
    heading: LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
    cases: [
      entry(
        'last-layer:orient-corners-f',
        LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
        'Sticker on F',
        repeatOrientAlg(2),
        invertMoves(repeatOrientAlg(2)),
      ),
      entry(
        'last-layer:orient-corners-r',
        LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
        'Sticker on R',
        repeatOrientAlg(4),
        invertMoves(repeatOrientAlg(4)),
      ),
    ],
  },
];

const CATALOGS: Partial<Record<ActiveLessonId, CaseReferenceCatalog>> = {
  'white-corners': {
    lessonId: 'white-corners',
    groups: WHITE_CORNERS_GROUPS,
  },
  'middle-layer-edges': {
    lessonId: 'middle-layer-edges',
    groups: MIDDLE_LAYER_GROUPS,
  },
  'last-layer': {
    lessonId: 'last-layer',
    groups: LAST_LAYER_GROUPS,
  },
};

export function getCaseCatalogForLesson(
  lessonId: ActiveLessonId,
): CaseReferenceCatalog | null {
  return CATALOGS[lessonId] ?? null;
}

const ALL_CASE_SECTIONS: CaseReferenceLessonSection[] = [
  {
    lessonTitle: whiteCornersLesson.title.replace(/^Lesson: /, ''),
    groups: WHITE_CORNERS_GROUPS,
  },
  {
    lessonTitle: middleLayerLesson.title.replace(/^Lesson: /, ''),
    groups: MIDDLE_LAYER_GROUPS,
  },
  {
    lessonTitle: lastLayerLesson.title.replace(/^Lesson: /, ''),
    groups: LAST_LAYER_GROUPS,
  },
];

export function getAllCaseReferenceSections(): CaseReferenceLessonSection[] {
  return ALL_CASE_SECTIONS;
}

export function getCaseSetupCubeState(entry: CaseReferenceEntry): CubeState {
  const setup = entry.setupMoves ?? invertMoves(entry.algMoves);
  return studentSetupFromMoves(setup);
}

export function getCaseDemoMoves(entry: CaseReferenceEntry): Move[] {
  return [...entry.algMoves];
}

const ZERO_FLOW_PERMUTE_CASE_ID = 'last-layer:permute-corners-zero-flow';

function zeroFlowPermuteCaseInstructions(): Instruction[] {
  const alg = movesToAlgString(PERMUTE_CORNERS_ALG);
  const phases = ZERO_FLOW_PERMUTE_PHASES;
  const instructions: Instruction[] = [
    {
      type: 'move',
      move: PERMUTE_CORNERS_ALG[0]!,
      label: 'Permute',
      text: `Run ${alg} once.`,
    },
  ];

  if (phases.length > 2) {
    instructions.push({
      type: 'rotation',
      rotation: 'y2',
      label: 'Reorient',
      text: 'Turn the whole cube so the permuted corner sits at front-right on U.',
    });
  }

  instructions.push({
    type: 'move',
    move: PERMUTE_CORNERS_ALG[0]!,
    label: 'Permute',
    text: `Repeat ${alg} until all four top corners are permuted.`,
  });

  return instructions;
}

export function getCaseDemoInstructions(
  entry: CaseReferenceEntry,
): Instruction[] | undefined {
  if (entry.id === ZERO_FLOW_PERMUTE_CASE_ID) {
    return zeroFlowPermuteCaseInstructions();
  }
  return undefined;
}

export function getCaseInstructionPhaseLengths(
  entry: CaseReferenceEntry,
): number[] | undefined {
  if (entry.id === ZERO_FLOW_PERMUTE_CASE_ID) {
    const phases = ZERO_FLOW_PERMUTE_PHASES;
    if (phases.length <= 2) {
      return [phases[0]!.length, phases[1]!.length];
    }
    return phases.map((phase) => phase.length);
  }
  return undefined;
}

export { ORIENT_CORNER_ALG };
