import { create } from 'zustand';
import type { CornerHoldIndex } from '@/domains/lesson-engine/layers/bottomLayer/corners/cornerHold';
import type { CornerSlotId } from '@/domains/lesson-engine/layers/bottomLayer/corners/types';
import type { MiddleEdgeSlotId } from '@/domains/lesson-engine/layers/middleLayer/edges/index';
import type { SeenLastLayerIntros } from '@/domains/lesson-engine/layers/lastLayer/types';
import { WHITE_CORNERS_LESSON_ID } from '@/domains/lesson-engine/layers/bottomLayer/corners/index';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '@/domains/lesson-engine/layers/middleLayer/edges/index';
import { LAST_LAYER_LESSON_ID } from '@/domains/lesson-engine/layers/lastLayer/index';
import type { ActiveLessonId } from '@/app/store/cubeStore';

export type LearningSection = 'learn' | 'notation' | 'cases';

export type NotationSectionId =
  | 'cubePieces'
  | 'faceNames'
  | 'positionLabels'
  | 'faceTurns'
  | 'cubeRotations';

export type WhiteCrossSession = {
  hasSeenStrategyIntro: boolean;
};

export type CornerSessionUndoEntry =
  | { kind: 'reorient'; previousHoldIndex: CornerHoldIndex }
  | { kind: 'solve'; previousSolvedCornerIds: CornerSlotId[] };

export type WhiteCornersSession = {
  currentHoldIndex: CornerHoldIndex;
  solvedCornerIds: CornerSlotId[];
  hasSeenStrategyIntro: boolean;
  sessionUndoStack: CornerSessionUndoEntry[];
};

export type MiddleSessionUndoEntry =
  | { kind: 'reorient'; previousHoldIndex: CornerHoldIndex }
  | { kind: 'solve'; previousSolvedSlots: MiddleEdgeSlotId[] };

export type MiddleLayerSession = {
  currentHoldIndex: CornerHoldIndex;
  solvedMiddleEdgeSlots: MiddleEdgeSlotId[];
  hasSeenStrategyIntro: boolean;
  sessionUndoStack: MiddleSessionUndoEntry[];
};

export type LastLayerSession = {
  currentHoldIndex: CornerHoldIndex;
  inOrientCornersPhase?: boolean;
  seenIntros: SeenLastLayerIntros;
  hasAcknowledgedOrientEdgesComplete?: boolean;
  sessionUndoStack: LastSessionUndoEntry[];
};

export type LastSessionUndoEntry = {
  previousSession: Omit<LastLayerSession, 'sessionUndoStack'>;
  withCubeApply: boolean;
};

export type LessonSessionById = {
  'white-cross': WhiteCrossSession;
  [WHITE_CORNERS_LESSON_ID]: WhiteCornersSession;
  [MIDDLE_LAYER_EDGES_LESSON_ID]: MiddleLayerSession;
  [LAST_LAYER_LESSON_ID]: LastLayerSession;
};

export type SessionsByLesson = Partial<LessonSessionById>;

export interface LessonSessionStore {
  learningSection: LearningSection;
  notationSection: NotationSectionId;
  sessionsByLesson: SessionsByLesson;

  setLearningSection: (section: LearningSection) => void;
  setNotationSection: (section: NotationSectionId) => void;
  getSession: <T extends ActiveLessonId>(
    lessonId: T,
  ) => SessionsByLesson[T] | undefined;
  setSession: <T extends ActiveLessonId>(
    lessonId: T,
    session: SessionsByLesson[T],
  ) => void;
  clearSessionForLesson: (lessonId: ActiveLessonId) => void;
  clearAllSessions: () => void;
  resetUiState: () => void;
}

export const useLessonSessionStore = create<LessonSessionStore>((set, get) => ({
  learningSection: 'learn',
  notationSection: 'cubePieces',
  sessionsByLesson: {},

  setLearningSection: (learningSection) => set({ learningSection }),

  setNotationSection: (notationSection) => set({ notationSection }),

  getSession: (lessonId) => get().sessionsByLesson[lessonId],

  setSession: (lessonId, session) =>
    set((state) => ({
      sessionsByLesson: {
        ...state.sessionsByLesson,
        [lessonId]: session,
      },
    })),

  clearSessionForLesson: (lessonId) =>
    set((state) => {
      const next = { ...state.sessionsByLesson };
      delete next[lessonId];
      return { sessionsByLesson: next };
    }),

  clearAllSessions: () => set({ sessionsByLesson: {} }),

  resetUiState: () =>
    set({ learningSection: 'learn', notationSection: 'cubePieces' }),
}));
