import type { Face } from '@/domains/cube/cubeState';

export const notationGuide = {
  replayAnimationsHover: 'Replay animations (up to 5 while hovered)',
  replayAnimationsTap: 'Replay animations (up to 5 while a move is selected)',
} as const;

export function notationReplayAnimationsLabel(prefersHover: boolean): string {
  return prefersHover
    ? notationGuide.replayAnimationsHover
    : notationGuide.replayAnimationsTap;
}

export const notationCubePieces = {
  heading: 'Cube pieces',
  introHover:
    'A 3x3 cube has three kinds of pieces. Centers stay fixed on each face. Edges sit between two faces. Corners sit where three faces meet. Hover a card to see that piece type on the cube.',
  introTap:
    'A 3x3 cube has three kinds of pieces. Centers stay fixed on each face. Edges sit between two faces. Corners sit where three faces meet. Tap a card to see that piece type on the cube.',
  labels: {
    center: 'Center',
    edge: 'Edge',
    corner: 'Corner',
  },
  descriptions: {
    center: 'One sticker per face. Centers never move.',
    edge: 'Two stickers. Twelve edge pieces on the cube.',
    corner: 'Three stickers. Eight corner pieces on the cube.',
  },
} as const;

export const notationFaceNames = {
  heading: 'Face names',
  introHover:
    "Each letter names a side of the cube based on how you're holding it, not a sticker color. Green might be on F today and on L after you rotate the whole cube. Hover a face to see where it is on the cube.",
  introTap:
    "Each letter names a side of the cube based on how you're holding it, not a sticker color. Green might be on F today and on L after you rotate the whole cube. Tap a face to see where it is on the cube.",
  labels: {
    F: 'Front',
    R: 'Right',
    U: 'Up',
    L: 'Left',
    B: 'Back',
    D: 'Down',
  } as Record<Face, string>,
} as const;

export const notationPositionLabels = {
  heading: 'Position labels',
  introHover:
    'Positions are named by the faces that meet there. An edge sits on two faces, so it gets two letters (UF). A corner sits on three faces, so it gets three (URF). Hover a card to see that spot on the cube.',
  introTap:
    'Positions are named by the faces that meet there. An edge sits on two faces, so it gets two letters (UF). A corner sits on three faces, so it gets three (URF). Tap a card to see that spot on the cube.',
  edgesHeading: 'Edges',
  cornersHeading: 'Corners',
  examples: {
    UF: 'Up and Front',
    DR: 'Down and Right',
    URF: 'Up, Right, and Front',
    FRD: 'Front, Right, and Down',
  },
} as const;

export const notationFaceTurns = {
  heading: 'Face turns',
  introHover:
    "Hover a move to see it on the cube. The turn stays visible while you're on the card. Move away and the cube returns to how it was.",
  introTap:
    'Tap a move to see it on the cube. Tap another move to switch. The demo stays until you pick a different card or leave this section.',
} as const;

export const notationCubeRotations = {
  heading: 'Cube rotations',
  introHover:
    'These rotate the whole cube in your hands. After a rotation, F still means front and U still means up, but the colors on those faces change. For example, with green on F and white on U, a y turn puts red on F and green on L. The rotated view stays while you hover; leave the card to reset.',
  introTap:
    'These rotate the whole cube in your hands. After a rotation, F still means front and U still means up, but the colors on those faces change. For example, with green on F and white on U, a y turn puts red on F and green on L. Tap a card to rotate; tap another card or leave this section to reset.',
} as const;

/** Pick hover vs tap instructional copy for the current pointer mode. */
export function notationPointerIntro(
  prefersHover: boolean,
  copy: { readonly introHover: string; readonly introTap: string },
): string {
  return prefersHover ? copy.introHover : copy.introTap;
}

const FACE_POSITION: Record<Face, string> = {
  U: 'top',
  D: 'bottom',
  F: 'front',
  B: 'back',
  L: 'left',
  R: 'right',
};

export function facePosition(face: Face): string {
  return FACE_POSITION[face];
}

export function turnDirectionLabel(modifier: '' | "'" | '2'): string {
  if (modifier === '2') return '180°';
  if (modifier === "'") return 'counterclockwise';
  return 'clockwise';
}

export function faceTurnDescription(position: string, direction: string): string {
  return `Turn the ${position} layer ${direction}`;
}

export function rotationDescription(direction: string, axis: string): string {
  return `Rotate the whole cube ${direction} around the ${axis}-axis`;
}
