import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSolvedCubeState } from '../../cube/cubeState';
import { MoveSequenceDemoProvider } from '../MoveSequenceDemo';
import { LessonPracticePanel } from './LessonPracticePanel';
import { lessonLayout } from '../../content/tips';

describe('LessonPracticePanel', () => {
  afterEach(() => cleanup());

  it('shows practice controls, algorithm, and current move explanation together', () => {
    render(
      <MoveSequenceDemoProvider
        baseCubeState={createSolvedCubeState()}
        moves={['R', 'U', "R'", "U'"]}
        instructions={[
          { type: 'move', move: 'R', text: 'Turn the right face clockwise.' },
          { type: 'move', move: 'U', text: 'Turn the top face clockwise.' },
          {
            type: 'move',
            move: "R'",
            text: 'Turn the right face counter-clockwise.',
          },
          {
            type: 'move',
            move: "U'",
            text: 'Turn the top face counter-clockwise.',
          },
        ]}
      >
        <LessonPracticePanel practiceGoalSummary="Line up the side sticker, then slot white on the bottom." />
      </MoveSequenceDemoProvider>,
    );

    expect(
      screen.getByText(
        'Line up the side sticker, then slot white on the bottom.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: lessonLayout.practiceHeading }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: lessonLayout.play }),
    ).toBeInTheDocument();
    expect(screen.getByText(lessonLayout.algorithmHeading)).toBeInTheDocument();
    expect(screen.getByText(lessonLayout.moveOf(1, 4))).toBeInTheDocument();
    expect(
      screen.getByText('Turn the right face clockwise.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "R'" })).toBeInTheDocument();
  });

  it('jumps the demo to a tapped algorithm move', async () => {
    const user = userEvent.setup();
    render(
      <MoveSequenceDemoProvider
        baseCubeState={createSolvedCubeState()}
        moves={['R', 'U']}
        instructions={[
          { type: 'move', move: 'R', text: 'Right face clockwise.' },
          { type: 'move', move: 'U', text: 'Top face clockwise.' },
        ]}
      >
        <LessonPracticePanel />
      </MoveSequenceDemoProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'U' }));
    expect(screen.getByText(lessonLayout.moveOf(2, 2))).toBeInTheDocument();
    expect(screen.getByText('Top face clockwise.')).toBeInTheDocument();
  });

  it('cycles playback speed', async () => {
    const user = userEvent.setup();
    render(
      <MoveSequenceDemoProvider
        baseCubeState={createSolvedCubeState()}
        moves={['R']}
        instructions={[{ type: 'move', move: 'R', text: 'Right face.' }]}
      >
        <LessonPracticePanel />
      </MoveSequenceDemoProvider>,
    );

    const speed = screen.getByRole('button', { name: 'Playback speed 1x' });
    expect(speed).toHaveTextContent('1×');
    await user.click(speed);
    expect(
      screen.getByRole('button', { name: 'Playback speed 2x' }),
    ).toHaveTextContent('2×');
    await user.click(screen.getByRole('button', { name: 'Playback speed 2x' }));
    expect(
      screen.getByRole('button', { name: 'Playback speed 0.5x' }),
    ).toHaveTextContent('0.5×');
  });
});
