export {
  colorStickerOnU,
  cornerWhiteStickerOnD,
  edgeAlignedToSideCenter,
  faceForColorOnEdge,
  faceForWhiteOnCorner,
  faceForWhiteOnEdge,
  findCornerWithColors,
  findEdgeWithColors,
  isMiddleLayerEdge,
  whiteStickerOnD,
  whiteStickerOnU,
} from '@/domains/lesson-engine/layers/bottomLayer/shared/pieceQueries';

export { isWhiteCrossComplete } from '@/domains/lesson-engine/layers/bottomLayer/cross/crossSlotModel';
import type { Color } from '@/domains/cube/cubeState';

/** Lowercase color name for piece references in lesson step copy. */
export function formatColor(color: Color): string {
  return color;
}
