import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cubePrompt } from '@/content/onboarding/onboarding';
import { useCubeStore } from '@/app/store/cubeStore';
import { renderWithRouter } from '@/shared/test/renderWithRouter';
import { CubePromptPanel } from '@/features/onboarding/components/CubePromptPanel';

describe('CubePromptPanel', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useCubeStore.setState({ appPhase: 'cubePrompt' });
  });

  it('sends scrambled choice to scanning', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CubePromptPanel />);

    await user.click(
      screen.getByRole('button', { name: cubePrompt.scrambled }),
    );

    expect(useCubeStore.getState().appPhase).toBe('scanning');
  });

  it('sends solved choice to scrambleSetup', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CubePromptPanel />);

    await user.click(screen.getByRole('button', { name: cubePrompt.solved }));

    expect(useCubeStore.getState().appPhase).toBe('scrambleSetup');
  });
});
