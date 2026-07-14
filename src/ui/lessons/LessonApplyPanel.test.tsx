import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonApplyFooter } from './LessonApplyPanel';
import { ui } from '../../content/ui';

describe('LessonApplyFooter', () => {
  afterEach(() => cleanup());

  it('renders full-width apply when canApply', async () => {
    const onApply = vi.fn();
    render(
      <LessonApplyFooter
        canApply
        applyLabel={ui.applyExampleContinue}
        applyHint="Apply when ready."
        onApply={onApply}
      />,
    );

    const applyButton = screen.getByRole('button', {
      name: ui.applyExampleContinue,
    });
    expect(applyButton.className).toContain('w-full');
    await userEvent.click(applyButton);
    expect(onApply).toHaveBeenCalled();
    expect(screen.getByText('Apply when ready.')).toBeInTheDocument();
  });

  it('renders alternate actions instead of apply', () => {
    render(
      <LessonApplyFooter
        canApply={false}
        applyLabel={ui.continue}
        onApply={vi.fn()}
        alternateActions={<button type="button">Continue intro</button>}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Continue intro' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: ui.applyExampleContinue }),
    ).not.toBeInTheDocument();
  });
});
