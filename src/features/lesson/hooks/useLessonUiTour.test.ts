import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  buildLessonUiTourSteps,
  resetUiTourForTips,
  useLessonUiTour,
} from '@/features/lesson/hooks/useLessonUiTour';
import { setUiTourCompleted } from '@/domains/lesson-engine/lessonPreferences';

const drive = vi.fn();
const destroy = vi.fn();

vi.mock('driver.js', () => ({
  driver: vi.fn(() => ({
    drive,
    destroy,
    isActive: () => false,
  })),
}));

vi.mock('driver.js/dist/driver.css', () => ({}));

describe('buildLessonUiTourSteps', () => {
  it('only includes anchors present in the root', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-tour="progress"></div>
      <div data-tour="tabs"></div>
      <div data-tour="apply"></div>
    `;

    const steps = buildLessonUiTourSteps(root);
    expect(steps.map((s) => s.element)).toEqual([
      '[data-tour="progress"]',
      '[data-tour="tabs"]',
      '[data-tour="apply"]',
    ]);
  });
});

describe('useLessonUiTour', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    drive.mockClear();
    destroy.mockClear();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
    });
    document.body.innerHTML = `
      <div data-tour="progress"></div>
      <div data-tour="tabs"></div>
      <div data-tour="controls"></div>
      <div data-tour="apply"></div>
      <div data-tour="options"></div>
    `;
    vi.stubGlobal(
      'requestAnimationFrame',
      (cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      },
    );
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('does not prompt when the tour was already completed', async () => {
    setUiTourCompleted(true);
    const { driver } = await import('driver.js');

    const { result } = renderHook(() => useLessonUiTour(true));

    expect(result.current.promptOpen).toBe(false);
    expect(driver).not.toHaveBeenCalled();
  });

  it('opens the prompt when enabled and the tour is incomplete', async () => {
    setUiTourCompleted(false);
    const { driver } = await import('driver.js');

    const { result } = renderHook(() => useLessonUiTour(true));

    expect(result.current.promptOpen).toBe(true);
    expect(driver).not.toHaveBeenCalled();
  });

  it('starts the tour when the user accepts the prompt', async () => {
    setUiTourCompleted(false);
    const { driver } = await import('driver.js');

    const { result } = renderHook(() => useLessonUiTour(true));

    act(() => {
      result.current.startTour();
    });

    expect(result.current.promptOpen).toBe(false);
    expect(driver).toHaveBeenCalled();
    expect(drive).toHaveBeenCalled();
  });

  it('declining closes the prompt without starting the tour or persisting', async () => {
    setUiTourCompleted(false);
    const { driver } = await import('driver.js');

    const { result } = renderHook(() => useLessonUiTour(true));

    act(() => {
      result.current.declineTour();
    });

    expect(result.current.promptOpen).toBe(false);
    expect(driver).not.toHaveBeenCalled();
    expect(storage.get('solving-it.lesson.uiTourCompleted')).not.toBe('true');
  });

  it('dontShowAgain on decline persists and closes the prompt', async () => {
    setUiTourCompleted(false);
    const { driver } = await import('driver.js');

    const { result } = renderHook(() => useLessonUiTour(true));

    act(() => {
      result.current.declineTour({ dontShowAgain: true });
    });

    expect(result.current.promptOpen).toBe(false);
    expect(driver).not.toHaveBeenCalled();
    expect(storage.get('solving-it.lesson.uiTourCompleted')).toBe('true');
  });

  it('dontShowAgain on start persists and still starts the tour', async () => {
    setUiTourCompleted(false);
    const { driver } = await import('driver.js');

    const { result } = renderHook(() => useLessonUiTour(true));

    act(() => {
      result.current.startTour({ dontShowAgain: true });
    });

    expect(result.current.promptOpen).toBe(false);
    expect(driver).toHaveBeenCalled();
    expect(storage.get('solving-it.lesson.uiTourCompleted')).toBe('true');
  });

  it('does not prompt when disabled', async () => {
    setUiTourCompleted(false);

    const { result } = renderHook(() => useLessonUiTour(false));

    expect(result.current.promptOpen).toBe(false);
  });

  it('resetUiTourForTips clears the completed preference', () => {
    setUiTourCompleted(true);
    resetUiTourForTips();
    expect(storage.get('solving-it.lesson.uiTourCompleted')).toBe('false');
  });
});
