import { useEffect, useMemo, useState, useTransition } from "react";
import type { Move } from "../cube/cubeState";
import {
  cubeStateToStudentFrame,
  faceCentersFromCubeState,
  formatColorLabel,
  studentLessonHoldFaceCenters,
} from "../cube/cubeState";
import {
  getAvoidBackDefaultPreference,
  setAvoidBackDefaultPreference,
} from "../learn/lessonPreferences";
import {
  demoStepsToMoves,
  expandDemoToInstructions,
  getLessonDemoExpansion,
  isBackFaceMove,
  noneHold,
  type DemoStep,
  type Instruction,
} from "../learn/studentHold";
import { useCubeStore } from "../store/cubeStore";
import { CubeView } from "../cube3d/CubeView";
import { MoveSequenceDemo } from "./MoveSequenceDemo";
import { useWhiteCrossLessonStep } from "./lessons/bottomLayer/useWhiteCrossLessonStep";
import { resolveVisibleDemo, type DemoSnapshot } from "./lessons/lessonDemo";

const PHYSICAL_CUBE_MATCH_NOTE =
  "Confirm your physical cube matches the virtual cube below (same scramble and hold: white on bottom, yellow on top) before you apply an example.";

export function LearningCrossView() {
  const cubeState = useCubeStore((state) => state.cubeState);
  const setAppPhase = useCubeStore((state) => state.setAppPhase);
  const setActiveLesson = useCubeStore((state) => state.setActiveLesson);
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
  } = useWhiteCrossLessonStep(studentFrame);
  const isCrossComplete = isLessonComplete;

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

  const showAvoidBackToggle = useMemo(
    () => demoMoves.some(isBackFaceMove),
    [demoMoves],
  );
  const stepKey = useMemo(
    () => (step ? `${step.kind}:${demoMoves.join(" ")}` : "none"),
    [step, demoMoves],
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
    const avoidOn = avoidBackMoves && showAvoidBackToggle;
    return getLessonDemoExpansion(demoMoves, avoidOn, noneHold());
  }, [demoMoves, avoidBackMoves, showAvoidBackToggle]);

  const previewMoves = useMemo(
    () => demoStepsToMoves(demoExpansion.steps),
    [demoExpansion],
  );

  const avoidOn = avoidBackMoves && showAvoidBackToggle;

  const demoInstructions = useMemo(() => {
    if (!demoMoves.length) return [];
    return expandDemoToInstructions(demoMoves, noneHold(), {
      avoidBackMoves: avoidOn,
    }).instructions;
  }, [demoMoves, avoidOn]);

  const [demoSnapshot, setDemoSnapshot] = useState<DemoSnapshot | null>(null);

  useEffect(() => {
    if (step?.kind === "complete") {
      setDemoSnapshot(null);
      return;
    }
    if (isStepPending) return;
    if (demoMoves.length === 0) {
      setDemoSnapshot(null);
      return;
    }
    setDemoSnapshot({
      moves: previewMoves,
      demoSteps: demoExpansion.steps,
      instructions: demoInstructions,
      demoKey: `${stepKey}-${avoidBackMoves}`,
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
  ]);

  const currentDemo: DemoSnapshot | null = useMemo(
    () =>
      demoMoves.length > 0
        ? {
            moves: previewMoves,
            demoSteps: demoExpansion.steps,
            instructions: demoInstructions,
            demoKey: `${stepKey}-${avoidBackMoves}`,
          }
        : null,
    [
      demoMoves.length,
      previewMoves,
      demoExpansion.steps,
      demoInstructions,
      stepKey,
      avoidBackMoves,
    ],
  );

  const visibleDemo = resolveVisibleDemo({
    isLessonComplete: isCrossComplete,
    isStepPending,
    demoMovesLength: demoMoves.length,
    currentDemo,
    cachedDemo: demoSnapshot,
  });

  const lessonHold = useMemo(
    () =>
      studentFrame
        ? faceCentersFromCubeState(studentFrame)
        : studentLessonHoldFaceCenters(),
    [studentFrame],
  );

  if (!cubeState || !studentFrame) {
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
          kind: "solve-edge" as const,
          title: "Preparing lesson…",
          body: "",
          edgeLabel: "",
          partnerColor: "white" as const,
        }
      : {
          kind: "solve-edge" as const,
          title: "White cross",
          body: "",
          edgeLabel: "",
          partnerColor: "white" as const,
        });
  const canApplyDemo =
    step !== null &&
    !isStepPending &&
    demoMoves.length > 0 &&
    step.kind !== "complete";
  const showRotationCallout =
    canApplyDemo &&
    avoidBackMoves &&
    showAvoidBackToggle &&
    !hasSeenAvoidBackCallout &&
    previewMoves.includes("y2");

  const handleRestartLessonTips = () => {
    resetLessonSession();
    setAvoidBackMoves(false);
    recomputeStep();
  };

  const handleUndoLessonStep = () => {
    if (!canUndoLesson || isStepPending) return;
    startLessonTransition(() => {
      undoLessonStep();
      recomputeStep();
    });
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lesson: White cross</h1>
          <p className="mt-1 text-slate-300">
            Hold your cube with{" "}
            <span className="text-slate-100">white on the bottom</span> and{" "}
            <span className="text-slate-100">yellow on top</span>. Face{" "}
            <span className="text-slate-100">
              {formatColorLabel(lessonHold.F)} toward you
            </span>{" "}
            — that is the <span className="text-slate-100">front (F)</span> face
            in the diagram below (the virtual cube shows{" "}
            {formatColorLabel(lessonHold.F)} on F). Notation: U ={" "}
            {formatColorLabel(lessonHold.U)}, D ={" "}
            {formatColorLabel(lessonHold.D)}, F ={" "}
            {formatColorLabel(lessonHold.F)}.
          </p>
          {!isCrossComplete ? (
            <p className="mt-2 text-sm text-slate-400">
              {PHYSICAL_CUBE_MATCH_NOTE}
            </p>
          ) : null}
          {step && step.kind !== "complete" && (
            <p className="mt-2 text-sm text-slate-400">
              Progress: <span className="text-slate-200">{solvedSlots}/4</span>{" "}
              cross edges solved (white on the bottom, side sticker matches its
              center).
            </p>
          )}
          <details className="mt-3 text-sm text-slate-400">
            <summary className="cursor-pointer text-slate-300 hover:text-slate-100">
              Lesson session & reset
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
              <li>
                <span className="text-slate-300">Undo last example</span>{" "}
                restores the virtual cube to before your most recent Apply. The
                next step title may differ (for example a permute vs a slotting
                step) even though the cube matches an earlier point in the
                lesson.
              </li>
              <li>
                <span className="text-slate-300">Apply example</span> updates
                your virtual cube and advances the lesson. Orientation from y2
                bookends is stored on the cube; the internal hold flag resets
                each apply.
              </li>
              <li>
                <span className="text-slate-300">Reset lesson tips</span> clears
                the one-time rotation tip and hold flag only — your cube
                scramble is unchanged.
              </li>
              <li>
                <span className="text-slate-300">Start lesson</span> from the
                cube overview runs the same session reset before opening this
                view.
              </li>
              <li>
                Re-opening the lesson without starting fresh does not reset your
                cube or progress on it.
              </li>
            </ul>
          </details>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleUndoLessonStep}
            disabled={!canUndoLesson || isStepPending}
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
        </div>
      </header>

      {isCrossComplete ? (
        <CubeView
          cubeState={studentFrame}
          meshRotation={[0, 0, 0]}
          frameClassName="h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
          canvasKey="lesson-complete-cube"
        />
      ) : (
        <div className="relative">
          <MoveSequenceDemo
            baseCubeState={studentFrame}
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
                Finding a short demo sequence for this cube.
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
                  {formatColorLabel(lessonHold.F)} is on front (usual lesson
                  hold).
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
        {step && step.kind !== "complete" && (
          <p className="mt-3 text-xs text-slate-500">
            Same hold as the diagram: {formatColorLabel(lessonHold.F)} on F
            (front), {formatColorLabel(lessonHold.U)} on U (top),{" "}
            {formatColorLabel(lessonHold.D)} on D (bottom).
          </p>
        )}
        {isCrossComplete ? (
          <p className="mt-4 text-sm text-slate-400">
            All four cross edges are in place. Continue to white corners when
            you are ready, or use Back to cube overview.
          </p>
        ) : null}
        {isCrossComplete ? (
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
              onClick={() => {
                resetLessonSession();
                setActiveLesson("white-corners");
              }}
            >
              Continue: White corners
            </button>
          </div>
        ) : null}
        {canApplyDemo && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              When your physical cube matches the diagram and you have stepped
              through the example (or reproduced it on your cube), apply here to
              update the virtual cube and continue the lesson.
            </p>
            <button
              type="button"
              disabled={isStepPending}
              className="inline-flex shrink-0 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                startLessonTransition(() => {
                  if (avoidOn) {
                    applyLessonStep(demoMoves, { avoidBackMoves: true });
                    if (previewMoves.includes("y2") && !hasSeenAvoidBackCallout)
                      markAvoidBackCalloutSeen();
                  } else {
                    applyLessonDemoMoves(demoMoves);
                  }
                });
              }}
            >
              Apply example & continue
            </button>
          </div>
        )}
      </article>
    </section>
  );
}
