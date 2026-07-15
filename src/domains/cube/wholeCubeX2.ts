import type { CubeState } from '@/domains/cube/cubeState';
import { wholeCubeMove } from '@/domains/cube/wholeCube';

/**
 * Lesson student-frame swap (x2). Prefer {@link wholeCubeMove}(state, 'x2') or {@link applyMove}(state, 'x2').
 */
export function wholeCubeX2(state: CubeState): CubeState {
  return wholeCubeMove(state, 'x2');
}
