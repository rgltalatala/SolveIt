import { useEffect, useMemo, useState, useTransition } from "react";
import type { Move } from "../cube/cubeState";
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  formatColorLabel,
  isWholeCubeRotation,
  studentLessonHoldFaceCenters,
} from "../cube/cubeState";
import {
  getAvoidBackDefaultPreference,
  setAvoidBackDefaultPreference,
} from "../learn/lessonPreferences";
import {
  resolveLessonStorageDemo,
} from "../learn/layers/bottomLayer/corners";
import {
  demoStepsToMoves,
  expandDemoToInstructions,
  getLessonDemoExpansion,
  getRotationText,
  isBackFaceMove,
  noneHold,
  type DemoStep,
  type Instruction,
} from "../learn/studentHold";
import type { YRotationStep } from "../learn/studentHold/types";
import { useCubeStore } from "../store/cubeStore";
import { CubeView } from "../cube3d/CubeView";
import { MoveSequenceDemo } from "./MoveSequenceDemo";
import { useWhiteCornerLessonStep } from "./lessons/bottomLayer/useWhiteCornerLessonStep";
import { resolveVisibleDemo, type DemoSnapshot } from "./lessons/lessonDemo";

const PHYSICAL_CUBE_MATCH_NOTE =
  "Confirm your physical cube matches the virtual cube below (same scramble and hold: white on bottom, yellow on top) before you apply an example.";

function expandHoldReorientDemo(moves: Move[]): {
  steps: DemoStep[];
  instructions: Instruction[];
} {
  const steps: DemoStep[] = moves
    .filter(isWholeCubeRotation)
    .map((rotation) => ({
      type: "rotation" as const,
      rotation: rotation as YRotationStep,
    }));
  const instructions: Instruction[] = steps.map((step) => ({
    type: "rotation" as const,
    rotation: step.rotation,
    text: getRotationText(step.rotation),
  }));
  return { steps, instructions };
}

export function LearningCornersView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
  const activeLesson = useCubeStore((state) => state.activeLesson);
  const applyLessonDemoMoves = useCubeStore(
    (state) => state.applyLessonDemoMoves,
  );
  const applyLessonStep = useCubeStore((state) => state.applyLessonStep);
  const hasSeenAvoidBackCallout = useCubeStore(
    (state) => state.hasSeenAvoidBackCallout,
  );
  const markAvoidBackCalloutSeen = useCubeStore(
    (state) => state.markAvoidBackCalloutSeen,
  );
  const resetLessonSession = useCubeStore((state) => state.resetLessonSession);
  const undoLessonStep = useCubeStore((state) => state.undoLessonStep);
  const canUndoLesson = useCubeStore((state) => state.lessonHistory.length > 0);

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
    solvedSlots,
    recomputeStep,
    currentHoldIndex,
    solvedCornerIds,
    sessionUndoStack,
    advanceAfterStep,
    undoCornerSessionStep,
    resetCornerSession,
  } = useWhiteCornerLessonStep(studentFrame, { resetKey: activeLesson });

  const displayFrame = studentFrame;

  const demoMoves = useMemo((): Move[] => {
    if (
      step &&
      "demoMoves" in step &&
      step.demoMoves &&
      step.demoMoves.length > 0
    ) {
      return step.demoMoves;
    }
    return [];
  }, [step]);

  const isHoldReorientStep = step?.kind === "reorient-hold";

  const storageDemoMoves = useMemo((): Move[] => {
    if (
      isHoldReorientStep ||
      !studentFrame ||
      !step ||
      step.kind !== "solve-corner" ||
      !demoMoves.length
    ) {
      return demoMoves;
    }
    return (
      resolveLessonStorageDemo(
        studentFrame,
        step.cornerId,
        currentHoldIndex,
        demoMoves,
        solvedCornerIds,
      ) ?? demoMoves
    );
  }, [
    demoMoves,
    studentFrame,
    step,
    isHoldReorientStep,
    currentHoldIndex,
    solvedCornerIds,
  ]);

  const viewDemoMoves = useMemo((): Move[] => {
    if (isHoldReorientStep) return demoMoves;
    if (step?.kind === "solve-corner" && storageDemoMoves.length > 0) {
      // Demos are verified on the y-baked student cube; show the same sequence apply uses.
      return storageDemoMoves;
    }
    return demoMoves;
  }, [demoMoves, storageDemoMoves, step?.kind, isHoldReorientStep]);

  const showAvoidBackToggle = useMemo(
    () => viewDemoMoves.some(isBackFaceMove),
    [viewDemoMoves],
  );
  const stepKey = useMemo(
    () => (step ? `${step.kind}:${viewDemoMoves.join(" ")}` : "none"),
    [step, viewDemoMoves],
  );
  const [avoidBackMoves, setAvoidBackMoves] = useState(false);
  const [rememberAvoidBackDefault, setRememberAvoidBackDefault] = useState(() =>
    getAvoidBackDefaultPreference(),
  );

  useEffect(() => {
    if (showAvoidBackToggle) {
      setAvoidBackMoves(getAvoidBackDefaultPreference());
    } else {
      setAvoidBackMoves(false);
    }
  }, [stepKey, showAvoidBackToggle]);

  const demoExpansion = useMemo(() => {
    if (isHoldReorientStep) {
      return expandHoldReorientDemo(viewDemoMoves);
    }
    const avoidOn = avoidBackMoves && showAvoidBackToggle;
    return getLessonDemoExpansion(viewDemoMoves, avoidOn, noneHold());
  }, [viewDemoMoves, avoidBackMoves, showAvoidBackToggle, isHoldReorientStep]);

  const previewMoves = useMemo(
    () => (isHoldReorientStep ? viewDemoMoves : demoStepsToMoves(demoExpansion.steps)),
    [demoExpansion.steps, viewDemoMoves, isHoldReorientStep],
  );

  const avoidOn = avoidBackMoves && showAvoidBackToggle;

  const demoInstructions = useMemo(() => {
    if (!viewDemoMoves.length) return [];
    if (isHoldReorientStep) {
      return expandHoldReorientDemo(viewDemoMoves).instructions;
    }
    return expandDemoToInstructions(viewDemoMoves, noneHold(), {
      avoidBackMoves: avoidOn,
    }).instructions;
  }, [viewDemoMoves, avoidOn, isHoldReorientStep]);

  const [demoSnapshot, setDemoSnapshot] = useState<DemoSnapshot | null>(null);

  useEffect(() => {
    if (step?.kind === "complete") {
      setDemoSnapshot(null);
      return;
    }
    if (isStepPending) return;
    if (viewDemoMoves.length === 0) {
      setDemoSnapshot(null);
      return;
    }
    setDemoSnapshot({
      moves: previewMoves,
      demoSteps: demoExpansion.steps,
      instructions: demoInstructions,
      demoKey: `${stepKey}-${avoidBackMoves}-${currentHoldIndex}`,
    });
  }, [
    step?.kind,
    isStepPending,
    demoMoves.length,
    previewMoves,
    demoExpansion.steps,
    demoInstructions,
    stepKey,
    avoidBackMoves,
    currentHoldIndex,
  ]);

  const currentDemo: DemoSnapshot | null = useMemo(
    () =>
      viewDemoMoves.length > 0
        ? {
            moves: previewMoves,
            demoSteps: demoExpansion.steps,
            instructions: demoInstructions,
            demoKey: `${stepKey}-${avoidBackMoves}-${currentHoldIndex}`,
          }
        : null,
    [
      viewDemoMoves.length,
      previewMoves,
      demoExpansion.steps,
      demoInstructions,
      stepKey,
      avoidBackMoves,
      currentHoldIndex,
    ],
  );

  const visibleDemo = resolveVisibleDemo({
    isLessonComplete,
    isStepPending,
    demoMovesLength: viewDemoMoves.length,
    currentDemo,
    cachedDemo: demoSnapshot,
  });

  const lessonHold = useMemo(
    () =>
      displayFrame
        ? faceCentersFromCubeState(displayFrame)
        : studentLessonHoldFaceCenters(),
    [displayFrame],
  );

  const lastSessionEntry =
    sessionUndoStack[sessionUndoStack.length - 1] ?? null;
  const canUndo =
    lastSessionEntry !== null && canUndoLesson;

  if (!cubeState || !studentFrame || !displayFrame) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Lesson unavailable</h1>
        <p className="text-slate-300">Scan and validate a cube first.</p>
        <button
          type="button"
          className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
          onClick={() => setAppPhase("ready")}
        >
          Back
        </button>
      </section>
    );
  }

  const displayStep =
    step ??
    (showPreparingOverlay
      ? {
          kind: "solve-corner" as const,
          title: "Preparing lesson…",
          body: "",
          cornerId: "FRD" as const,
        }
      : {
          kind: "solve-corner" as const,
          title: "White corners",
          body: "",
          cornerId: "FRD" as const,
        });

  const isReorientStep = step?.kind === "reorient-hold";
  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    demoMoves.length > 0 &&
    step.kind !== "complete" &&
    step.kind !== "cross-prerequisite";

  const showRotationCallout =
    canApplyDemo &&
    avoidBackMoves &&
    showAvoidBackToggle &&
    !hasSeenAvoidBackCallout &&
    previewMoves.includes("y2");

  const completeDisplayFrame = studentFrame;

  const handleRestartLessonTips = () => {
    resetLessonSession();
    setAvoidBackMoves(false);
    recomputeStep();
  };

  const handleResetCornerSession = () => {
    resetCornerSession(studentFrame);
    recomputeStep();
  };

  const handleUndoLessonStep = () => {
    if (!canUndo || isStepPending) return;
    startLessonTransition(() => {
      undoLessonStep();
      undoCornerSessionStep();
    });
  };

  const handleApplyDemo = () => {
    if (!step || !canApplyDemo) return;
    startLessonTransition(() => {
      if (step.kind === "reorient-hold") {
        advanceAfterStep(step);
        applyLessonDemoMoves(step.demoMoves);
        return;
      }
      if (step.kind === "solve-corner") {
        advanceAfterStep(step);
        if (avoidOn) {
          applyLessonStep(storageDemoMoves, { avoidBackMoves: true });
          if (previewMoves.includes("y2") && !hasSeenAvoidBackCallout) {
            markAvoidBackCalloutSeen();
          }
        } else {
          applyLessonDemoMoves(storageDemoMoves);
        }
      }
    });
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lesson: White corners</h1>
          <p className="mt-1 text-slate-300">
            Hold your cube with{" "}
            <span className="text-slate-100">white on the bottom</span> and{" "}
            <span className="text-slate-100">yellow on top</span>. Face{" "}
            <span className="text-slate-100">
              {formatColorLabel(lessonHold.F)} toward you
            </span>{" "}
            — that is the <span className="text-slate-100">front (F)</span> face
            in the diagram below.
          </p>
          {!isLessonComplete ? (
            <p className="mt-2 text-sm text-slate-400">
              {PHYSICAL_CUBE_MATCH_NOTE}
            </p>
          ) : null}
          {step && step.kind !== "complete" && step.kind !== "cross-prerequisite" ? (
            <p className="mt-2 text-sm text-slate-400">
              Progress: <span className="text-slate-200">{solvedSlots}/4</span>{" "}
              white corners solved (white on D, side stickers match their
              centers).
            </p>
          ) : null}
          <details className="mt-3 text-sm text-slate-400">
            <summary className="cursor-pointer text-slate-300 hover:text-slate-100">
              Lesson session & reset
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
              <li>
                <span className="text-slate-300">Reorient steps</span> rotate
                the virtual cube (whole-cube y turns) so the next corner faces
                you.
              </li>
              <li>
                <span className="text-slate-300">Undo last example</span>{" "}
                restores the virtual cube before the last apply (corner demo or
                reorient).
              </li>
              <li>
                <span className="text-slate-300">Reset corner session</span>{" "}
                clears hold tracking and re-counts solved corners from the
                current cube — your scramble is unchanged.
              </li>
            </ul>
          </details>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleUndoLessonStep}
            disabled={!canUndo || isStepPending}
          >
            Undo last example
          </button>
          <button
            type="button"
            className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700"
            onClick={() => setAppPhase("ready")}
          >
            Back to cube overview
          </button>
          <button
            type="button"
            className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            onClick={handleRestartLessonTips}
          >
            Reset lesson tips
          </button>
          <button
            type="button"
            className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            onClick={handleResetCornerSession}
          >
            Reset corner session
          </button>
        </div>
      </header>

      {isLessonComplete ? (
        <CubeView
          cubeState={completeDisplayFrame}
          meshRotation={[0, 0, 0]}
          frameClassName="h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
          canvasKey="corners-lesson-complete-cube"
        />
      ) : (
        <div className="relative">
          <MoveSequenceDemo
            baseCubeState={displayFrame}
            moves={visibleDemo?.moves ?? []}
            demoSteps={visibleDemo?.demoSteps}
            instructions={visibleDemo?.instructions}
            meshRotation={[0, 0, 0]}
            frameClassName="h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
          />
          {showPreparingOverlay ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-950/75 px-4 text-center">
              <p className="text-sm font-semibold text-slate-100">
                Preparing next example…
              </p>
              <p className="text-xs text-slate-400">
                Finding a short demo sequence for this corner.
              </p>
            </div>
          ) : null}
        </div>
      )}

      <article
        className={`rounded-xl border border-slate-700 bg-slate-900/80 p-4 ${showPreparingOverlay ? "opacity-60" : ""}`}
      >
        <h2 className="text-lg font-semibold text-slate-100">
          {displayStep.title}
        </h2>
        {displayStep.body ? (
          <p className="mt-2 whitespace-pre-wrap text-slate-300">
            {displayStep.body}
          </p>
        ) : null}

        {step?.kind === "cross-prerequisite" ? (
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
              onClick={() => setActiveLesson("white-cross")}
            >
              Go to white cross lesson
            </button>
          </div>
        ) : null}

        {step && step.kind !== "complete" && showAvoidBackToggle ? (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-950/40 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Avoid back face for this example
                </p>
                <p className="text-xs text-slate-400">
                  This step’s example uses a{" "}
                  <span className="font-mono">B</span> move. Toggle on to{" "}
                  <span className="text-slate-300">y2</span> at the start, do
                  the example without turning B, then{" "}
                  <span className="text-slate-300">y2</span> again so{" "}
                  {formatColorLabel(lessonHold.F)} is on front.
                </p>
              </div>
              <button
                type="button"
                className={`inline-flex w-fit shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
                  avoidBackMoves
                    ? "bg-violet-700 text-white hover:bg-violet-600"
                    : "border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                }`}
                onClick={() => setAvoidBackMoves((v) => !v)}
              >
                {avoidBackMoves
                  ? "Avoid back moves: On"
                  : "Avoid back moves: Off"}
              </button>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                className="rounded border-slate-600"
                checked={rememberAvoidBackDefault}
                onChange={(e) => {
                  const on = e.target.checked;
                  setRememberAvoidBackDefault(on);
                  setAvoidBackDefaultPreference(on);
                  if (on) setAvoidBackMoves(true);
                }}
              />
              Default avoid-back on when an example uses B (saved in this
              browser)
            </label>
            {showRotationCallout ? (
              <div className="flex flex-col gap-2 rounded-md border border-amber-700/40 bg-amber-950/30 p-2 text-amber-100">
                <p className="text-xs">
                  Tip: the preview starts and ends with{" "}
                  <span className="font-mono">y2</span> so you return to the
                  same hold ({formatColorLabel(lessonHold.F)} on front). Step
                  through the full sequence on your cube.
                </p>
                <div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-amber-100 underline hover:text-amber-50"
                    onClick={() => markAvoidBackCalloutSeen()}
                  >
                    Got it
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step && step.kind !== "complete" && step.kind !== "cross-prerequisite" ? (
          <p className="mt-3 text-xs text-slate-500">
            Same hold as the diagram: {formatColorLabel(lessonHold.F)} on F
            (front), {formatColorLabel(lessonHold.U)} on U (top),{" "}
            {formatColorLabel(lessonHold.D)} on D (bottom).
            {isReorientStep
              ? " After you turn the cube in your hands to match, continue — the virtual scramble stays the same."
              : null}
          </p>
        ) : null}

        {canApplyDemo ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              {isReorientStep
                ? "When your physical cube matches the hold shown, continue to the next step."
                : "When your physical cube matches the diagram and you have stepped through the example, apply here to update the virtual cube and continue."}
            </p>
            <button
              type="button"
              disabled={isStepPending}
              className="inline-flex shrink-0 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleApplyDemo}
            >
              {isReorientStep ? "Continue" : "Apply example & continue"}
            </button>
          </div>
        ) : null}

        {isLessonComplete ? (
          <p className="mt-4 text-sm text-slate-400">
            Bottom layer corners are complete. Use Back to cube overview when
            you are ready.
          </p>
        ) : null}
      </article>
    </section>
  );
}
