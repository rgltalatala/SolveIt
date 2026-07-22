import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CubeState, Color } from '@/domains/cube/cubeState';
import type { LessonWorkspaceMode, LessonWorkspaceTabId } from '@/features/lesson/hooks/useLessonWorkspaceTab';
import { useLessonUiTour } from '@/features/lesson/hooks/useLessonUiTour';
import { TourPrompt } from '@/features/onboarding/components/TourPrompt';
import { MoveSequenceDemoProvider } from '@/shared/components/MoveSequenceDemo';
import type { DemoSnapshot } from '@/features/lesson/utils/lessonDemo';
import { LessonCasePanel } from '@/features/lesson/components/LessonCasePanel';
import { LessonApplyFooter } from '@/features/lesson/components/LessonApplyPanel';
import { LessonHeader } from '@/features/lesson/components/LessonHeader';
import { LessonCubeStage } from '@/features/lesson/components/LessonCubeStage';
import { LessonSecondaryPanels } from '@/features/lesson/components/LessonSecondaryPanels';
import { LearningSplitLayout } from '@/shared/components/LearningSplitLayout';
import { CubeView } from '@/domains/cube/3d/CubeView';
import { LEARNING_CUBE_FRAME_CLASS } from '@/shared/components/LearningSplitLayout';
import type { LessonProgressConfig } from '@/features/lesson/components/LessonProgress';
import { LessonProgress } from '@/features/lesson/components/LessonProgress';
import { LessonWorkspaceTabs } from '@/features/lesson/components/LessonWorkspaceTabs';
import { useLessonWorkspaceTab } from '@/features/lesson/hooks/useLessonWorkspaceTab';
import { LessonPracticePanel } from '@/features/lesson/components/LessonPracticePanel';
import { lessonLayout } from '@/content/beginner/tips';

type FaceCenters = {
  F: Color;
  U: Color;
  D: Color;
};

export type LessonViewShellProps = {
  header: {
    title: string;
    subtitle?: string;
    titleClassName?: string;
    progress?: LessonProgressConfig;
    canUndo: boolean;
    isStepPending: boolean;
    onUndo: () => void;
    onRescan: () => void;
    onResetTips: () => void;
    extraSessionActions?: ReactNode;
  };
  step: {
    title: string;
    body?: string;
    practiceGoalSummary?: string;
    dimmed?: boolean;
    caseChildren?: ReactNode;
  };
  cube: {
    isComplete: boolean;
    cubeState: CubeState;
    completeCanvasKey: string;
    visibleDemo: DemoSnapshot | null;
    showPreparingOverlay: boolean;
    preparingSubtitle?: string;
    celebrate?: boolean;
  };
  demo?: {
    canApply: boolean;
    applyLabel: string;
    applyHint?: string;
    onApply: () => void;
    alternateActions?: ReactNode;
  };
  secondary: {
    lessonHold: FaceCenters;
    showOrientationPanel?: boolean;
    showSameHoldNote?: boolean;
    showReorientNote?: boolean;
    orientationExtra?: ReactNode;
    avoidBack?: {
      frontColor: Color;
      avoidBackMoves: boolean;
      onToggleAvoidBack: () => void;
      rememberAvoidBackDefault: boolean;
      onRememberDefaultChange: (on: boolean) => void;
      showRotationCallout: boolean;
      onMarkCalloutSeen: () => void;
      holdNote?: string;
    };
  };
};

function hasMoreContent(
  secondary: LessonViewShellProps['secondary'],
  applyHint?: string,
): boolean {
  return (
    secondary.showOrientationPanel !== false ||
    Boolean(secondary.orientationExtra) ||
    Boolean(secondary.avoidBack) ||
    Boolean(applyHint)
  );
}

function MorePanel({
  secondary,
  applyHint,
}: {
  secondary: LessonViewShellProps['secondary'];
  applyHint?: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm text-slate-300">
      {applyHint ? <p className="text-xs leading-relaxed">{applyHint}</p> : null}
      <LessonSecondaryPanels
        {...secondary}
        showOrientationPanel={secondary.showOrientationPanel !== false}
      />
    </div>
  );
}

function GoalPanel({
  step,
  progress,
}: {
  step: LessonViewShellProps['step'];
  progress?: LessonProgressConfig;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {lessonLayout.workspaceTabs.why}
        </h3>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
          {step.body ?? step.title}
        </p>
      </div>
      {progress ? <LessonProgress progress={progress} compact={false} /> : null}
    </div>
  );
}

function WorkspaceTabPanel({
  tab,
  step,
  progress,
  secondary,
  applyHint,
}: {
  tab: LessonWorkspaceTabId | null;
  step: LessonViewShellProps['step'];
  progress?: LessonProgressConfig;
  secondary: LessonViewShellProps['secondary'];
  applyHint?: string;
}) {
  if (!tab) return null;
  if (tab === 'practice') {
    return <LessonPracticePanel practiceGoalSummary={step.practiceGoalSummary} />;
  }
  if (tab === 'why') return <GoalPanel step={step} progress={progress} />;
  return <MorePanel secondary={secondary} applyHint={applyHint} />;
}

/**
 * Single-pane lesson workflow:
 * compact case title → tabs → one tab body → Continue pinned.
 */
function workspaceModeForDemo(
  demo: LessonViewShellProps['demo'],
): LessonWorkspaceMode {
  if (!demo) return 'complete';
  if (demo.alternateActions && !demo.canApply) return 'intro';
  return 'active';
}

function LessonWorkflowColumn({
  step,
  demo,
  secondary,
  progress,
  isStepPending,
  hasPractice,
}: {
  step: LessonViewShellProps['step'];
  demo?: LessonViewShellProps['demo'];
  secondary: LessonViewShellProps['secondary'];
  progress?: LessonProgressConfig;
  isStepPending: boolean;
  hasPractice: boolean;
}) {
  const mode = workspaceModeForDemo(demo);
  const hasBody = Boolean(step.body);
  const hasMore = hasMoreContent(secondary, demo?.applyHint);

  const { tab, setTab, tabs } = useLessonWorkspaceTab({
    mode,
    hasPractice,
    hasBody,
    hasMore,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <LessonCasePanel title={step.title} dimmed={step.dimmed}>
        {step.caseChildren}
      </LessonCasePanel>

      {tabs.length > 0 ? (
        <LessonWorkspaceTabs tabs={tabs} activeTab={tab} onChange={setTab} />
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        <WorkspaceTabPanel
          tab={tab}
          step={step}
          progress={progress}
          secondary={secondary}
          applyHint={demo?.applyHint}
        />
      </div>

      {demo ? (
        <LessonApplyFooter
          canApply={demo.canApply}
          applyLabel={demo.applyLabel}
          applyHint={undefined}
          disabled={isStepPending}
          onApply={demo.onApply}
          alternateActions={hasPractice ? undefined : demo.alternateActions}
        />
      ) : null}
    </div>
  );
}

function CompleteWorkflowColumn({
  step,
  demo,
  secondary,
  progress,
  isStepPending,
}: {
  step: LessonViewShellProps['step'];
  demo?: LessonViewShellProps['demo'];
  secondary: LessonViewShellProps['secondary'];
  progress?: LessonProgressConfig;
  isStepPending: boolean;
}) {
  const hasBody = Boolean(step.body);
  const completeSecondary = {
    ...secondary,
    showOrientationPanel: false as const,
  };
  const hasMore = hasMoreContent(completeSecondary);
  const tabs = useMemo<LessonWorkspaceTabId[]>(() => {
    const next: LessonWorkspaceTabId[] = [];
    if (hasBody) next.push('why');
    if (hasMore) next.push('more');
    return next;
  }, [hasBody, hasMore]);
  const [tab, setTab] = useState<LessonWorkspaceTabId | null>(tabs[0] ?? null);

  useEffect(() => {
    if (tab !== null && !tabs.includes(tab)) {
      setTab(tabs[0] ?? null);
    }
  }, [tabs, tab]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <LessonCasePanel title={step.title} dimmed={step.dimmed}>
        {step.caseChildren}
      </LessonCasePanel>

      {tabs.length > 0 ? (
        <LessonWorkspaceTabs tabs={tabs} activeTab={tab} onChange={setTab} />
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        <WorkspaceTabPanel
          tab={tab}
          step={step}
          progress={progress}
          secondary={completeSecondary}
        />
      </div>

      {demo?.alternateActions ? (
        <LessonApplyFooter
          canApply={false}
          applyLabel={demo.applyLabel}
          disabled={isStepPending}
          onApply={demo.onApply}
          alternateActions={demo.alternateActions}
        />
      ) : null}
    </div>
  );
}

export function LessonViewShell({
  header,
  step,
  cube,
  demo,
  secondary,
}: LessonViewShellProps) {
  const isIntroOnly =
    Boolean(demo?.alternateActions) && !demo?.canApply && !cube.isComplete;
  const hasPractice = Boolean(demo) && !isIntroOnly && !cube.isComplete;
  const { promptOpen, startTour, declineTour } = useLessonUiTour(hasPractice);

  let sidebar: ReactNode = null;
  if (cube.isComplete) {
    sidebar = (
      <CompleteWorkflowColumn
        step={step}
        demo={demo}
        secondary={secondary}
        progress={header.progress}
        isStepPending={header.isStepPending}
      />
    );
  } else if (demo) {
    sidebar = (
      <LessonWorkflowColumn
        step={step}
        demo={demo}
        secondary={secondary}
        progress={header.progress}
        isStepPending={header.isStepPending}
        hasPractice={hasPractice}
      />
    );
  }

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-3 py-2 sm:px-4">
      <TourPrompt
        open={promptOpen}
        onStart={startTour}
        onDecline={declineTour}
      />
      <LessonHeader {...header} />
      {cube.isComplete ? (
        <LearningSplitLayout
          cube={
            <div className="relative h-full min-h-0 flex-1">
              <CubeView
                cubeState={cube.cubeState}
                meshRotation={[0, 0, 0]}
                frameClassName={LEARNING_CUBE_FRAME_CLASS}
                canvasKey={cube.completeCanvasKey}
                autoRotate={cube.celebrate}
              />
            </div>
          }
          sidebar={sidebar}
        />
      ) : (
        <MoveSequenceDemoProvider
          baseCubeState={cube.cubeState}
          moves={cube.visibleDemo?.moves ?? []}
          demoSteps={cube.visibleDemo?.demoSteps}
          instructions={cube.visibleDemo?.instructions}
          meshRotation={[0, 0, 0]}
          frameClassName={LEARNING_CUBE_FRAME_CLASS}
        >
          <LessonCubeStage
            showPreparingOverlay={cube.showPreparingOverlay}
            preparingSubtitle={cube.preparingSubtitle}
            sidebar={sidebar}
          />
        </MoveSequenceDemoProvider>
      )}
    </section>
  );
}
