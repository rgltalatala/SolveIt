import { useEffect, useMemo, useTransition, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { Move } from '@/domains/cube/cubeState';
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  isWholeCubeRotation,
  studentLessonHoldFaceCenters,
} from '@/domains/cube/cubeState';
import {
  isCornersFullyPermuted,
  isEdgesFullyPermuted,
  isLastLayerComplete,
  isYellowCrossComplete,
  LAST_LAYER_LESSON_ID,
} from '@/domains/lesson-engine/layers/lastLayer/index';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '@/domains/lesson-engine/layers/middleLayer/edges/index';
import {
  getRotationText,
  type DemoStep,
  type Instruction,
} from '@/domains/lesson-engine/studentHold/index';
import type { YRotationStep } from '@/domains/lesson-engine/studentHold/types';
import { lastLayerLesson } from '@/content/beginner/lastLayer';
import { applyHints, preparing } from '@/content/beginner/tips';
import { ui } from '@/content/onboarding/ui';
import { resetUiTourForTips } from '@/features/lesson/hooks/useLessonUiTour';
import { deriveLastLayerSubLessonId, lessonPath } from '@/features/lesson/lessonLoader';
import { useLessonNavigation } from '@/features/lesson/hooks/useLessonNavigation';
import { useCubeStore } from '@/app/store/cubeStore';
import { useLessonSessionStore } from '@/features/lesson/store/lessonSessionStore';
import { useLastLayerLessonStep } from '@/features/lesson/hooks/lastLayer/useLastLayerLessonStep';
import {
  progressLabelForLastLayerPhase,
  resolveLastLayerProgressPhase,
  resolveLastLayerSubLessonLabel,
} from '@/features/lesson/utils/lastLayerPhaseLabels';
import { LessonUnavailable } from '@/features/lesson/components/LessonUnavailable';
import { LessonViewShell } from '@/features/lesson/components/LessonViewShell';
import { lastLayerLessonProgress } from '@/features/lesson/utils/lessonProgressBuilders';
import { useLessonDemoPipeline } from '@/features/lesson/hooks/useLessonDemoPipeline';
import { cornerHoldToStudentHold } from '@/domains/lesson-engine/layers/bottomLayer/corners/index';

function expandHoldReorientDemo(moves: Move[]): {
  steps: DemoStep[];
  instructions: Instruction[];
} {
  const rotations = moves.filter(isWholeCubeRotation) as YRotationStep[];
  const steps: DemoStep[] = rotations.map((rotation) => ({
    type: 'rotation' as const,
    rotation,
  }));
  const instructions: Instruction[] = rotations.map((rotation) => ({
    type: 'rotation' as const,
    rotation,
    text: getRotationText(rotation),
  }));
  return { steps, instructions };
}

function expandReorientDemoForPipeline(moves: Move[]) {
  const expanded = expandHoldReorientDemo(moves);
  return { ...expanded, previewMoves: moves };
}

function getLastLayerAlternateActions(options: {
  stepKind: string | undefined;
  isStepPending: boolean;
  onContinueIntro: () => void;
  onContinueOrientEdgesComplete: () => void;
  onGoToWhiteCross: () => void;
  onGoToWhiteCorners: () => void;
  onGoToMiddleLayer: () => void;
}): ReactNode {
  const {
    stepKind,
    isStepPending,
    onContinueIntro,
    onContinueOrientEdgesComplete,
    onGoToWhiteCross,
    onGoToWhiteCorners,
    onGoToMiddleLayer,
  } = options;

  if (stepKind === 'intro') {
    return (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        onClick={onContinueIntro}
        disabled={isStepPending}
      >
        {ui.continue}
      </button>
    );
  }
  if (stepKind === 'orient-edges-already-complete') {
    return (
      <button
        type="button"
        className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        onClick={onContinueOrientEdgesComplete}
        disabled={isStepPending}
      >
        {ui.continue}
      </button>
    );
  }
  if (stepKind === 'prerequisite') {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          onClick={onGoToWhiteCross}
        >
          {lastLayerLesson.goToWhiteCross}
        </button>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
          onClick={onGoToWhiteCorners}
        >
          {lastLayerLesson.goToWhiteCorners}
        </button>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          onClick={onGoToMiddleLayer}
        >
          {lastLayerLesson.goToMiddleLayer}
        </button>
      </div>
    );
  }
  return undefined;
}

export function LearningLastLayerView() {
  const { goToLesson } = useLessonNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const cubeState = useCubeStore((state) => state.cubeState);
  const applyLessonDemoMoves = useCubeStore(
    (state) => state.applyLessonDemoMoves,
  );
  const resetLessonSession = useCubeStore((state) => state.resetLessonSession);
  const undoLessonStep = useCubeStore((state) => state.undoLessonStep);
  const canUndoLesson = useCubeStore((state) => state.lessonHistory.length > 0);
  const startLessonRescan = useCubeStore((state) => state.startLessonRescan);

  const [, startLessonTransition] = useTransition();

  const studentFrame = useMemo(
    () => (cubeState ? cubeStateToStudentFrame(cubeState) : null),
    [cubeState],
  );

  const {
    step,
    isStepPending,
    showPreparingOverlay,
    isLessonComplete,
    recomputeStep,
    advanceAfterStep,
    currentHoldIndex,
    sessionUndoStack,
    undoLastSessionStep,
    resetLastSession,
    isEdgePermutePhase,
    isCornerPermutePhase,
    isCornerOrientPhase,
    inOrientCornersPhase,
  } = useLastLayerLessonStep(studentFrame);

  const demoMoves = useMemo((): Move[] => {
    if (
      step &&
      'demoMoves' in step &&
      step.demoMoves &&
      step.demoMoves.length > 0
    ) {
      return step.demoMoves;
    }
    return [];
  }, [step]);

  const isHoldReorientStep = step?.kind === 'reorient-hold';

  const stepKey = useMemo(
    () => (step ? `${step.kind}:${demoMoves.join(' ')}` : 'none'),
    [step, demoMoves],
  );

  const demoInitialHold = useMemo(
    () => cornerHoldToStudentHold(currentHoldIndex),
    [currentHoldIndex],
  );

  const { visibleDemo } = useLessonDemoPipeline({
    demoMoves,
    stepKey,
    isLessonComplete,
    isStepPending,
    stepKind: step?.kind,
    snapshotKeySuffix: `-${currentHoldIndex}`,
    initialHold: demoInitialHold,
    expandDemo: isHoldReorientStep ? expandReorientDemoForPipeline : undefined,
  });

  const lessonHold = useMemo(
    () =>
      studentFrame
        ? faceCentersFromCubeState(studentFrame)
        : studentLessonHoldFaceCenters(),
    [studentFrame],
  );

  const lastLayerSession = useLessonSessionStore(
    (state) => state.sessionsByLesson[LAST_LAYER_LESSON_ID],
  );

  // Keep the URL aligned with the derived sub-lesson so refresh deep-links correctly.
  useEffect(() => {
    if (!studentFrame) return;
    const derived = deriveLastLayerSubLessonId(studentFrame, lastLayerSession);
    const target = lessonPath(LAST_LAYER_LESSON_ID, derived);
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [studentFrame, lastLayerSession, location.pathname, navigate]);

  const lastSessionEntry =
    sessionUndoStack[sessionUndoStack.length - 1] ?? null;
  const canUndo =
    lastSessionEntry !== null &&
    (!lastSessionEntry.withCubeApply || canUndoLesson);

  if (!cubeState || !studentFrame) {
    return <LessonUnavailable />;
  }

  const isOrientEdgesLessonStep =
    step?.kind === 'orient-edges-already-complete' ||
    step?.kind === 'orient-edges' ||
    (step?.kind === 'align-u' && step.subLesson === 'orient-edges') ||
    (step?.kind === 'intro' && step.introId === 'orient-edges');

  const inOrientCornersLesson =
    inOrientCornersPhase ||
    step?.kind === 'orient-corners' ||
    (step?.kind === 'align-u' && step.subLesson === 'orient-corners');

  const edgePermutePhase =
    !inOrientCornersLesson &&
    !isOrientEdgesLessonStep &&
    (isEdgePermutePhase ||
      (studentFrame &&
        isYellowCrossComplete(studentFrame) &&
        !isEdgesFullyPermuted(studentFrame)));

  const cornerPermutePhase =
    !inOrientCornersLesson &&
    (isCornerPermutePhase ||
      (studentFrame &&
        isYellowCrossComplete(studentFrame) &&
        isEdgesFullyPermuted(studentFrame) &&
        !isCornersFullyPermuted(studentFrame)));

  const cornerOrientPhase =
    inOrientCornersLesson ||
    isCornerOrientPhase ||
    (studentFrame &&
      isYellowCrossComplete(studentFrame) &&
      isEdgesFullyPermuted(studentFrame) &&
      isCornersFullyPermuted(studentFrame) &&
      !isLastLayerComplete(studentFrame));

  const displayStep =
    step ??
    (showPreparingOverlay
      ? {
          kind: 'align-u' as const,
          title: preparing.lesson,
          body: '',
          demoMoves: [] as Move[],
          subLesson: 'orient-edges' as const,
          ollCase: 'l-shape' as const,
        }
      : {
          kind: 'align-u' as const,
          title: lastLayerLesson.defaultStepTitle,
          body: '',
          demoMoves: [] as Move[],
          subLesson: 'orient-edges' as const,
          ollCase: 'l-shape' as const,
        });

  const isReorientStep = step?.kind === 'reorient-hold';
  const isHoldSyncStep =
    isReorientStep &&
    demoMoves.length === 0 &&
    step.targetHoldIndex !== undefined &&
    step.targetHoldIndex !== currentHoldIndex;
  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    (demoMoves.length > 0 || isHoldSyncStep) &&
    step.kind !== 'complete' &&
    step.kind !== 'prerequisite' &&
    step.kind !== 'intro' &&
    step.kind !== 'orient-edges-already-complete';

  const handleRestartLessonTips = () => {
    resetLessonSession();
    resetLastSession();
    resetUiTourForTips();
    recomputeStep();
  };

  const handleUndoLessonStep = () => {
    if (!canUndo || isStepPending) return;
    startLessonTransition(() => {
      const withCubeApply = undoLastSessionStep();
      if (withCubeApply) {
        undoLessonStep();
      }
      recomputeStep();
    });
  };

  const handleContinueIntro = () => {
    if (step?.kind !== 'intro') return;
    startLessonTransition(() => {
      advanceAfterStep(step, studentFrame);
      recomputeStep();
    });
  };

  const handleContinueOrientEdgesComplete = () => {
    if (step?.kind !== 'orient-edges-already-complete') return;
    startLessonTransition(() => {
      advanceAfterStep(step, studentFrame);
      recomputeStep();
    });
  };

  const handleApplyDemo = () => {
    if (!step || !canApplyDemo) return;
    startLessonTransition(() => {
      if (
        step.kind === 'reorient-hold' ||
        step.kind === 'align-u' ||
        step.kind === 'orient-edges' ||
        step.kind === 'permute-edges' ||
        step.kind === 'permute-corners' ||
        step.kind === 'orient-corners'
      ) {
        advanceAfterStep(step, studentFrame);
        if (step.demoMoves.length > 0) {
          applyLessonDemoMoves(step.demoMoves);
        }
      }
    });
  };

  const phaseOptions = {
    isOrientEdgesLessonStep,
    cornerOrientPhase: !!cornerOrientPhase,
    cornerPermutePhase: !!cornerPermutePhase,
    edgePermutePhase: !!edgePermutePhase,
  };

  const subLessonLabel = resolveLastLayerSubLessonLabel({
    ...phaseOptions,
    introId: step?.kind === 'intro' ? step.introId : undefined,
  });

  const lastLayerProgressPhase = resolveLastLayerProgressPhase(phaseOptions);

  const progressLabelForPhase = (solved: number) =>
    progressLabelForLastLayerPhase(lastLayerProgressPhase, solved);

  const showProgress =
    !isLessonComplete &&
    step &&
    step.kind !== 'complete' &&
    step.kind !== 'prerequisite' &&
    step.kind !== 'intro';

  const workflowAlternateActions = getLastLayerAlternateActions({
    stepKind: step?.kind,
    isStepPending,
    onContinueIntro: handleContinueIntro,
    onContinueOrientEdgesComplete: handleContinueOrientEdgesComplete,
    onGoToWhiteCross: () => goToLesson('white-cross'),
    onGoToWhiteCorners: () => goToLesson('white-corners'),
    onGoToMiddleLayer: () => goToLesson(MIDDLE_LAYER_EDGES_LESSON_ID),
  });

  return (
    <LessonViewShell
      header={{
        title: isLessonComplete
          ? lastLayerLesson.completeTitle
          : lastLayerLesson.title,
        subtitle: isLessonComplete
          ? undefined
          : lastLayerLesson.subtitle,
        titleClassName: isLessonComplete ? 'text-emerald-100' : undefined,
        progress: showProgress
          ? {
              ...lastLayerLessonProgress(
                studentFrame,
                lastLayerProgressPhase,
                progressLabelForPhase,
                currentHoldIndex,
              ),
              phaseLabel: `${lastLayerLesson.subLessonPrefix} ${subLessonLabel}`,
            }
          : undefined,
        canUndo,
        isStepPending,
        onUndo: handleUndoLessonStep,
        onRescan: startLessonRescan,
        onResetTips: handleRestartLessonTips,
      }}
      step={{
        title: isLessonComplete
          ? lastLayerLesson.completeTitle
          : displayStep.title,
        body: isLessonComplete
          ? lastLayerLesson.completeBody
          : displayStep.body || undefined,
        practiceGoalSummary: isLessonComplete
          ? undefined
          : displayStep.practiceGoalSummary,
        dimmed: showPreparingOverlay,
      }}
      cube={{
        isComplete: isLessonComplete,
        cubeState: studentFrame,
        completeCanvasKey: 'last-layer-lesson-complete-cube',
        visibleDemo,
        showPreparingOverlay,
        preparingSubtitle: lastLayerLesson.preparingSubtitle,
        celebrate: isLessonComplete,
      }}
      demo={
        isLessonComplete
          ? undefined
          : {
              canApply: canApplyDemo,
              applyLabel: isReorientStep ? ui.continue : ui.applyExampleContinue,
              applyHint: canApplyDemo ? applyHints.solve : undefined,
              onApply: handleApplyDemo,
              alternateActions: workflowAlternateActions,
            }
      }
      secondary={{
        lessonHold,
        showSameHoldNote:
          step !== null &&
          step.kind !== 'complete' &&
          step.kind !== 'prerequisite' &&
          step.kind !== 'intro' &&
          step.kind !== 'orient-edges-already-complete',
        showReorientNote: isReorientStep,
      }}
    />
  );
}
