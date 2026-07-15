import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSolvedCubeState } from '@/domains/cube/cubeState';
import { resyncCopy } from '@/content/onboarding/ui';
import { useCubeStore } from '@/app/store/cubeStore';
import { renderWithRouter } from '@/shared/test/renderWithRouter';

vi.mock('@/domains/cube/3d/CubeView', () => ({
  CubeView: () => <div data-testid="cube-view" />,
}));

vi.mock('@/domains/lesson-engine/lessonResync', () => ({
  isLessonAheadOf: vi.fn(() => true),
  resyncLessonFromScan: vi.fn(async () => ({
    lesson: 'last-layer',
    previousLesson: 'white-corners',
    session: { currentHoldIndex: 0, seenIntros: {}, sessionUndoStack: [] },
    step: {
      kind: 'orient-edges',
      title: 'Orient the yellow cross',
      body: 'Line up yellow edges on top.',
      demoMoves: ["F", "R", "U", "R'", "U'", "F'"],
      ollCase: 'dot' as const,
    },
    holdIndex: 0,
  })),
}));

import { resyncLessonFromScan } from '@/domains/lesson-engine/lessonResync';
import { LessonResyncView } from '@/features/lesson/components/LessonResyncView';

describe('LessonResyncView', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    const cube = createSolvedCubeState();
    useCubeStore.setState({
      cubeState: cube,
      appPhase: 'lessonResync',
      scanReturnContext: { previousLesson: 'white-corners' },
      activeLesson: 'white-corners',
    });
  });

  it('shows determining state then step preview with lesson-changed note', async () => {
    renderWithRouter(<LessonResyncView />);

    expect(screen.getByText(resyncCopy.determiningTitle)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Orient the yellow cross')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        resyncCopy.lessonChangedNote('white corners', 'last layer'),
      ),
    ).toBeInTheDocument();
  });

  it('resumes into the inferred lesson on confirm', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LessonResyncView />);

    await waitFor(() => {
      expect(screen.getByText('Orient the yellow cross')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /Confirm — Resume lesson/i }),
    );

    expect(useCubeStore.getState().appPhase).toBe('learning');
    expect(useCubeStore.getState().activeLesson).toBe('last-layer');
    expect(useCubeStore.getState().scanReturnContext).toBeNull();
    expect(resyncLessonFromScan).toHaveBeenCalled();
  });

  it('shows initial scan copy and starts lesson when not rescanning from a lesson', async () => {
    useCubeStore.setState({
      scanReturnContext: null,
      activeLesson: 'white-cross',
    });

    renderWithRouter(<LessonResyncView />);

    await waitFor(() => {
      expect(screen.getByText(resyncCopy.initialConfirmTitle)).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        resyncCopy.initialLessonNote('last layer'),
      ),
    ).toBeInTheDocument();
  });
});
