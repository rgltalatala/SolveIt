import type { Face } from '../cube/cubeState';
import type { CubiePosition } from './cubeGeometry';
import { cubieDefinitions } from './cubeGeometry';

export type CubiePieceType = 'center' | 'edge' | 'corner';

export const ANATOMY_DIM = '#5c6370';
export const ANATOMY_PIECE_HIGHLIGHT = '#FFD500';

export type CubeAnatomyHighlight =
  | { mode: 'face'; face: Face | null }
  | { mode: 'pieceType'; pieceType: CubiePieceType | null };

export function getCubiePieceType(position: CubiePosition): CubiePieceType {
  const definition = cubieDefinitions.find(
    (c) =>
      c.position[0] === position[0] &&
      c.position[1] === position[1] &&
      c.position[2] === position[2],
  );
  const faceCount = definition?.exposedFaces.length ?? 0;
  if (faceCount === 1) return 'center';
  if (faceCount === 2) return 'edge';
  return 'corner';
}

export function resolveAnatomyStickerColor(
  highlight: CubeAnatomyHighlight | null | undefined,
  cubiePosition: CubiePosition,
  stickerFace: Face,
): string | null {
  if (!highlight) return null;

  if (highlight.mode === 'face') {
    if (highlight.face === null) return ANATOMY_DIM;
    return stickerFace === highlight.face
      ? ANATOMY_PIECE_HIGHLIGHT
      : ANATOMY_DIM;
  }

  if (highlight.pieceType === null) return ANATOMY_DIM;
  return getCubiePieceType(cubiePosition) === highlight.pieceType
    ? ANATOMY_PIECE_HIGHLIGHT
    : ANATOMY_DIM;
}
