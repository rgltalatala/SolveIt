import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { scrambleSetup } from '@/content/onboarding/onboarding';
import { moveSequenceDemo } from '@/content/beginner/tips';
import type { CubeMoveAnimation } from '@/domains/cube/3d/CubeView';
import { useCubeStore } from '@/app/store/cubeStore';
import { renderWithRouter } from '@/shared/test/renderWithRouter';

vi.mock('@/domains/cube/3d/CubeView', () => ({
  CubeView: ({
    moveAnimation,
  }: {
    moveAnimation?: CubeMoveAnimation | null;
  }) => (
    <div data-testid="cube-view">
      {moveAnimation ? (
        <button
          type="button"
          data-testid="complete-animation"
          onClick={() => moveAnimation.onComplete()}
        >
          complete
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock('@/domains/cube/random333Scramble', () => ({
  generateRandom333Scramble: () => "R U R' U'",
}));

import { ScrambleSetupView } from '@/features/onboarding/components/ScrambleSetupView';

describe('ScrambleSetupView', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useCubeStore.setState({
      appPhase: 'scrambleSetup',
      cubeState: null,
      activeLesson: 'white-cross',
    });
  });

  it('shows non-interactive scramble chips and enters the white-cross lesson on confirm', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ScrambleSetupView />);

    const chips = screen.getByLabelText(scrambleSetup.scrambleHeading);
    expect(within(chips).getByText('R')).toHaveAttribute('aria-current', 'step');
    expect(within(chips).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(scrambleSetup.confirmMatch)).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: scrambleSetup.confirmContinue }),
    );

    const state = useCubeStore.getState();
    expect(state.appPhase).toBe('learning');
    expect(state.activeLesson).toBe('white-cross');
    expect(state.cubeState).not.toBeNull();
  });

  it('highlights the current scramble move as the user steps next', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ScrambleSetupView />);

    const chips = screen.getByLabelText(scrambleSetup.scrambleHeading);
    expect(within(chips).getByText('R')).toHaveAttribute('aria-current', 'step');

    await user.click(
      screen.getByRole('button', { name: moveSequenceDemo.nextMove }),
    );
    await user.click(screen.getByTestId('complete-animation'));

    expect(within(chips).getByText('R')).not.toHaveAttribute('aria-current');
    expect(within(chips).getByText('U')).toHaveAttribute('aria-current', 'step');
  });

  it('steps with left and right arrow keys', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ScrambleSetupView />);

    const chips = screen.getByLabelText(scrambleSetup.scrambleHeading);
    expect(screen.getByText(scrambleSetup.keyboardHint)).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    await user.click(screen.getByTestId('complete-animation'));
    expect(within(chips).getByText('U')).toHaveAttribute('aria-current', 'step');

    await user.keyboard('{ArrowLeft}');
    await user.click(screen.getByTestId('complete-animation'));
    expect(within(chips).getByText('R')).toHaveAttribute('aria-current', 'step');
  });
});
