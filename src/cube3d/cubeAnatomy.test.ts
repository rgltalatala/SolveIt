import { describe, expect, it } from 'vitest';
import {
  ANATOMY_DIM,
  ANATOMY_PIECE_HIGHLIGHT,
  getCubiePieceType,
  resolveAnatomyStickerColor,
} from './cubeAnatomy';

describe('cubeAnatomy', () => {
  it('classifies center, edge, and corner cubies', () => {
    expect(getCubiePieceType([0, 1, 0])).toBe('center');
    expect(getCubiePieceType([1, 1, 0])).toBe('edge');
    expect(getCubiePieceType([1, 1, 1])).toBe('corner');
  });

  it('dims all stickers when face highlight is null', () => {
    expect(
      resolveAnatomyStickerColor(
        { mode: 'face', face: null },
        [1, 1, 1],
        'F',
      ),
    ).toBe(ANATOMY_DIM);
  });

  it('highlights only stickers on the highlighted face in yellow', () => {
    expect(
      resolveAnatomyStickerColor(
        { mode: 'face', face: 'F' },
        [0, 0, 1],
        'F',
      ),
    ).toBe(ANATOMY_PIECE_HIGHLIGHT);
    expect(
      resolveAnatomyStickerColor(
        { mode: 'face', face: 'F' },
        [0, 0, 1],
        'U',
      ),
    ).toBe(ANATOMY_DIM);
  });

  it('highlights matching piece types in yellow and dims others', () => {
    expect(
      resolveAnatomyStickerColor(
        { mode: 'pieceType', pieceType: 'edge' },
        [1, 1, 0],
        'F',
      ),
    ).toBe(ANATOMY_PIECE_HIGHLIGHT);
    expect(
      resolveAnatomyStickerColor(
        { mode: 'pieceType', pieceType: 'edge' },
        [1, 1, 1],
        'F',
      ),
    ).toBe(ANATOMY_DIM);
  });

  it('dims all stickers when piece type highlight is null', () => {
    expect(
      resolveAnatomyStickerColor(
        { mode: 'pieceType', pieceType: null },
        [1, 1, 1],
        'F',
      ),
    ).toBe(ANATOMY_DIM);
  });

  it('highlights a single cubie position and dims the rest', () => {
    expect(
      resolveAnatomyStickerColor(
        { mode: 'cubie', position: [0, 1, 1] },
        [0, 1, 1],
        'U',
      ),
    ).toBe(ANATOMY_PIECE_HIGHLIGHT);
    expect(
      resolveAnatomyStickerColor(
        { mode: 'cubie', position: [0, 1, 1] },
        [1, 1, 1],
        'U',
      ),
    ).toBe(ANATOMY_DIM);
  });

  it('dims all stickers when cubie highlight is null', () => {
    expect(
      resolveAnatomyStickerColor(
        { mode: 'cubie', position: null },
        [0, 1, 1],
        'U',
      ),
    ).toBe(ANATOMY_DIM);
  });
});
