import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { createSolvedCubeState } from '@/domains/cube/cubeState';
import { parseFaceTurnAlgToMoves } from '@/domains/cube/parseFaceTurnAlg';
import { generateRandom333Scramble } from '@/domains/cube/random333Scramble';
import { scrambleSetup } from '@/content/onboarding/onboarding';
import { prepareFreshLessonStart } from '@/features/lesson/store/lessonSessionPersistence';
import { lessonPath } from '@/features/lesson/lessonLoader';
import { useCubeStore } from '@/app/store/cubeStore';
import { LEARNING_CUBE_FRAME_CLASS } from '@/shared/components/LearningSplitLayout';
import {
  MoveSequenceDemoControls,
  MoveSequenceDemoCube,
  MoveSequenceDemoMoveChips,
  MoveSequenceDemoProvider,
  useMoveSequenceDemoContext,
} from '@/shared/components/MoveSequenceDemo';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/** Arrow keys mirror Next / Prev while the scramble setup page is mounted. */
function ScramblePlaybackKeyboard() {
  const { handleNext, handlePrev } = useMoveSequenceDemoContext();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      if (isTypingTarget(event.target)) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev]);

  return null;
}

/** Provide a scramble with animated playback, then confirm physical match and enter the lesson. */
export function ScrambleSetupView() {
  const navigate = useNavigate();
  const loadScrambledCubeIntoLesson = useCubeStore(
    (s) => s.loadScrambledCubeIntoLesson,
  );

  const [scrambleAlg] = useState(() => generateRandom333Scramble());
  const moves = useMemo(
    () => parseFaceTurnAlgToMoves(scrambleAlg),
    [scrambleAlg],
  );
  const baseCubeState = useMemo(() => createSolvedCubeState(), []);

  const handleConfirm = () => {
    prepareFreshLessonStart('white-cross');
    loadScrambledCubeIntoLesson(moves);
    navigate(lessonPath('white-cross'), { replace: true });
  };

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 p-6">
      <MoveSequenceDemoProvider
        baseCubeState={baseCubeState}
        moves={moves}
        meshRotation={[0, 0, 0]}
        frameClassName={LEARNING_CUBE_FRAME_CLASS}
      >
        <ScramblePlaybackKeyboard />
        <div className="flex w-full flex-col items-center gap-4">
          <header className="w-full space-y-2 text-center">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {scrambleSetup.scrambleHeading}
            </h1>
            <div className="flex justify-center">
              <MoveSequenceDemoMoveChips
                interactive={false}
                aria-label={scrambleSetup.scrambleHeading}
              />
            </div>
            <p className="text-sm text-slate-300">{scrambleSetup.followAlong}</p>
            <p className="text-xs text-slate-400">{scrambleSetup.keyboardHint}</p>
          </header>

          <div className="w-full">
            <MoveSequenceDemoControls />
          </div>

          <div className="h-[360px] w-full sm:h-[420px]">
            <MoveSequenceDemoCube />
          </div>

          <div className="w-full space-y-3 text-center">
            <p className="text-sm text-slate-300">{scrambleSetup.confirmMatch}</p>
            <button
              type="button"
              className="rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
              onClick={handleConfirm}
            >
              {scrambleSetup.confirmContinue}
            </button>
          </div>
        </div>
      </MoveSequenceDemoProvider>
    </section>
  );
}
