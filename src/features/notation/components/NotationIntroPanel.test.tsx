import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notationIntro } from '@/content/onboarding/onboarding';
import { useCubeStore } from '@/app/store/cubeStore';
import { renderWithRouter } from '@/shared/test/renderWithRouter';
import { NotationIntroPanel } from '@/features/notation/components/NotationIntroPanel';

describe('NotationIntroPanel', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    useCubeStore.setState({ appPhase: 'notation' });
  });

  it('continues to the cube state prompt', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotationIntroPanel />);

    await user.click(
      screen.getByRole('button', { name: notationIntro.continue }),
    );

    expect(useCubeStore.getState().appPhase).toBe('cubePrompt');
  });
});
