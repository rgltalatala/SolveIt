import Cube from 'cubejs/lib/cube';
import type { CubeState } from '@/domains/cube/cubeState';
import {
  cubeJsStringToCubeState,
  cubeStateToCubeJsString,
} from '@/domains/cube/cubeStateToFacelets';

type CubeJsMutable = {
  move(arg: string): void;
  asString(): string;
};

/**
 * Apply a whole-cube rotation (WCA x/y/z with optional prime or 2) via cubejs so facelets permute
 * as on a real cube.
 */
export function wholeCubeMove(state: CubeState, notation: string): CubeState {
  const c = Cube.fromString(
    cubeStateToCubeJsString(state),
  ) as unknown as CubeJsMutable;
  c.move(notation);
  return cubeJsStringToCubeState(c.asString());
}
