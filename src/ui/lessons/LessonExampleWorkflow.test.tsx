import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSolvedCubeState } from '../../cube/cubeState';
import { MoveSequenceDemoProvider } from '../MoveSequenceDemo';
import { LessonExampleWorkflow } from './LessonExampleWorkflow';
import { ui } from '../../content/ui';

describe('LessonExampleWorkflow', () => {
  it('renders full-width apply separate from navigation controls', async () => {
    const onApply = vi.fn();
    render(
      <MoveSequenceDemoProvider
        baseCubeState={createSolvedCubeState()}
        moves={['R', 'U']}
        instructions={[
          { type: 'move', move: 'R', text: 'Right face clockwise.' },
          { type: 'move', move: 'U', text: 'Top face clockwise.' },
        ]}
      >
        <LessonExampleWorkflow
          canApply
          applyLabel={ui.applyExampleContinue}
          applyHint="Apply when ready."
          onApply={onApply}
        />
      </MoveSequenceDemoProvider>,
    );

    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    const applyButton = screen.getByRole('button', {
      name: ui.applyExampleContinue,
    });
    expect(applyButton.className).toContain('w-full');
    await userEvent.click(applyButton);
    expect(onApply).toHaveBeenCalled();
    expect(screen.getByText('Apply when ready.')).toBeInTheDocument();
  });
});
