/** Chrome tour copy for the lesson workspace (Practice / Why / More, controls, apply, options). */

export const lessonUiTour = {
  done: 'Done',
  skip: 'Skip',
  next: 'Next',
  previous: 'Previous',
  prompt: {
    title: 'Take a quick tour?',
    body: 'We can walk you through the lesson layout: progress, tabs, demo controls, apply, and lesson options. It only takes a minute.',
    start: 'Yes, show me around',
    decline: 'No thanks',
    dontShowAgain: "Don't show again",
  },
  steps: {
    progress: {
      title: 'Progress',
      description:
        'This bar tracks how far you are through the lesson. It will fill as you solve pieces and complete steps.',
    },
    tabs: {
      title: 'Practice, Why, and More',
      description:
        'Practice has the demo, algorithm, and playback controls. Why explains the current step. More has cube orientation and extras.',
    },
    controls: {
      title: 'Demo controls',
      description:
        'Play the full demo, step move by move, reset, or change speed. Use these to follow along on your physical cube.',
    },
    apply: {
      title: 'Apply on my cube',
      description:
        'When you have matched the demo on your cube, apply the moves to the virtual cube and continue to the next step.',
    },
    options: {
      title: 'Lesson options',
      description:
        'Undo last example puts the virtual cube back before the last apply. Re-scan cube opens the scanner to sync with your physical cube. Reset lesson tips clears one-time tips (including this tour) without changing your scramble.',
    },
  },
} as const;
