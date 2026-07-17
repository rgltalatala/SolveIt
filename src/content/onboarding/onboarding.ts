import type { Face } from '@/domains/cube/cubeState';

const mirroredPreviewNote =
  "On a phone camera, left and right may look swapped. That's normal.";

export const notationIntro = {
  title: 'Cube notation & anatomy',
  subtitle:
    "Before you get started, let's cover how moves are written. It'll make every lesson step clearer.",
  openNotation: 'Explore notation',
  dontShowAgain: "Don't show this again when starting a new lesson",
  continue: 'Continue',
} as const;

export const cubePrompt = {
  title: 'How does your cube look?',
  body: 'Do you have a scrambled cube ready to scan, or a solved cube you can scramble with us?',
  scrambled: 'Scrambled',
  solved: 'Solved',
} as const;

export const scrambleSetup = {
  scrambleHeading: 'Scramble',
  followAlong:
    'Follow the scramble on your physical cube. Use the controls to play, step, or reset the animation.',
  keyboardHint:
    'Tip: use the left and right arrow keys to step through moves without clicking.',
  confirmMatch:
    "When you're done, check that your physical cube matches the virtual cube below.",
  confirmContinue: 'My cube matches. Continue',
} as const;

export const faceInstructions: Record<Face, string> = {
  U: `Scan the WHITE face: white toward the camera, green on top, blue on bottom, red on the right, orange on the left. ${mirroredPreviewNote}`,
  D: `Scan the YELLOW face: yellow toward the camera, green on top, blue on bottom, orange on the right, red on the left. ${mirroredPreviewNote}`,
  F: `Scan the GREEN face: green toward the camera, white on top, yellow on bottom, orange on the right, red on the left. ${mirroredPreviewNote}`,
  B: `Scan the BLUE face: blue toward the camera, white on top, yellow on bottom, red on the right, orange on the left. ${mirroredPreviewNote}`,
  R: `Scan the RED face: red toward the camera, white on top, yellow on bottom, green on the right, blue on the left. ${mirroredPreviewNote}`,
  L: `Scan the ORANGE face: orange toward the camera, white on top, yellow on bottom, blue on the right, green on the left. ${mirroredPreviewNote}`,
};
