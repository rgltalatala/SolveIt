import { useCallback, useEffect, useRef, useState } from 'react';
import { driver, type DriveStep, type PopoverDOM } from 'driver.js';
import 'driver.js/dist/driver.css';
import { lessonUiTour } from '@/content/beginner/lessonUiTour';
import {
  getUiTourCompleted,
  setUiTourCompleted,
} from '@/domains/lesson-engine/lessonPreferences';

export const LESSON_UI_TOUR_ANCHORS = [
  'progress',
  'tabs',
  'controls',
  'apply',
  'options',
] as const;

export type LessonUiTourAnchor = (typeof LESSON_UI_TOUR_ANCHORS)[number];

/** Dispatched when Reset lesson tips clears the tour preference so it can run again. */
export const UI_TOUR_RESET_EVENT = 'solving-it:lesson-ui-tour-reset';

export function resetUiTourForTips(): void {
  setUiTourCompleted(false);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UI_TOUR_RESET_EVENT));
  }
}

const STEP_COPY: Record<
  LessonUiTourAnchor,
  { title: string; description: string }
> = {
  progress: lessonUiTour.steps.progress,
  tabs: lessonUiTour.steps.tabs,
  controls: lessonUiTour.steps.controls,
  apply: lessonUiTour.steps.apply,
  options: lessonUiTour.steps.options,
};

/** Build tour steps for anchors that currently exist in the DOM. */
export function buildLessonUiTourSteps(
  root: ParentNode = document,
): DriveStep[] {
  const steps: DriveStep[] = [];
  for (const anchor of LESSON_UI_TOUR_ANCHORS) {
    const element = root.querySelector(`[data-tour="${anchor}"]`);
    if (!element) continue;
    const copy = STEP_COPY[anchor];
    steps.push({
      element: `[data-tour="${anchor}"]`,
      popover: {
        title: copy.title,
        description: copy.description,
        side: anchor === 'options' || anchor === 'progress' ? 'bottom' : 'left',
        align: 'start',
      },
    });
  }
  return steps;
}

function labelCloseAsSkip(popover: PopoverDOM): void {
  popover.closeButton.setAttribute('aria-label', lessonUiTour.skip);
  popover.closeButton.title = lessonUiTour.skip;
}

export type UseLessonUiTourResult = {
  promptOpen: boolean;
  startTour: (options?: { dontShowAgain?: boolean }) => void;
  declineTour: (options?: { dontShowAgain?: boolean }) => void;
};

/**
 * Prompts for a lesson chrome tour when Practice is active.
 * Completing the tour or choosing "Don't show again" persists via localStorage.
 * Declining only skips for the current visit unless don't-show-again is checked.
 */
export function useLessonUiTour(enabled: boolean): UseLessonUiTourResult {
  const dismissedThisMountRef = useRef(false);
  const [resetTick, setResetTick] = useState(0);
  const [promptOpen, setPromptOpen] = useState(false);
  const activeDriverRef = useRef<ReturnType<typeof driver> | null>(null);
  const exitReasonRef = useRef<'done' | 'skip'>('skip');

  useEffect(() => {
    const onReset = () => {
      dismissedThisMountRef.current = false;
      const active = activeDriverRef.current;
      activeDriverRef.current = null;
      active?.destroy();
      dismissedThisMountRef.current = false;
      setPromptOpen(false);
      setResetTick((n) => n + 1);
    };
    window.addEventListener(UI_TOUR_RESET_EVENT, onReset);
    return () => window.removeEventListener(UI_TOUR_RESET_EVENT, onReset);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setPromptOpen(false);
      return;
    }
    if (dismissedThisMountRef.current) return;
    if (getUiTourCompleted()) return;

    setPromptOpen(true);
  }, [enabled, resetTick]);

  useEffect(() => {
    return () => {
      if (activeDriverRef.current) {
        activeDriverRef.current.destroy();
        activeDriverRef.current = null;
      }
    };
  }, []);

  const runTour = useCallback(() => {
    if (activeDriverRef.current?.isActive()) return;

    const steps = buildLessonUiTourSteps();
    if (steps.length === 0) return;

    exitReasonRef.current = 'skip';

    const driverObj = driver({
      steps,
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'lesson-ui-tour-popover',
      nextBtnText: lessonUiTour.next,
      prevBtnText: lessonUiTour.previous,
      doneBtnText: lessonUiTour.done,
      skipMissingElement: true,
      onPopoverRender: (popover) => {
        labelCloseAsSkip(popover);
      },
      onDoneClick: (_element, _step, { driver: activeDriver }) => {
        exitReasonRef.current = 'done';
        activeDriver.destroy();
      },
      onCloseClick: (_element, _step, { driver: activeDriver }) => {
        exitReasonRef.current = 'skip';
        activeDriver.destroy();
      },
      onDestroyed: () => {
        if (activeDriverRef.current === driverObj) {
          activeDriverRef.current = null;
        }
        dismissedThisMountRef.current = true;
        if (exitReasonRef.current === 'done') {
          setUiTourCompleted(true);
        }
      },
    });

    activeDriverRef.current = driverObj;
    driverObj.drive();
  }, []);

  const startTour = useCallback(
    (options?: { dontShowAgain?: boolean }) => {
      if (options?.dontShowAgain) setUiTourCompleted(true);
      setPromptOpen(false);
      dismissedThisMountRef.current = true;
      // Wait a frame so the modal unmounts before the spotlight tour starts.
      requestAnimationFrame(() => {
        requestAnimationFrame(runTour);
      });
    },
    [runTour],
  );

  const declineTour = useCallback((options?: { dontShowAgain?: boolean }) => {
    if (options?.dontShowAgain) setUiTourCompleted(true);
    setPromptOpen(false);
    dismissedThisMountRef.current = true;
  }, []);

  return {
    promptOpen: enabled && promptOpen && !getUiTourCompleted(),
    startTour,
    declineTour,
  };
}
