import type { Move } from '@/domains/cube/cubeState';

/** Inverts a face-turn / rotation sequence (WCA-style). */
export function invertMoves(moves: readonly Move[]): Move[] {
  const inverted: Move[] = [];
  for (let i = moves.length - 1; i >= 0; i -= 1) {
    const move = moves[i]!;
    const face = move[0];
    if (move.endsWith('2')) inverted.push(move);
    else if (move.endsWith("'")) inverted.push(face as Move);
    else inverted.push(`${face}'` as Move);
  }
  return inverted;
}
