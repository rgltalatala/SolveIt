import { describe, expect, it } from 'vitest';
import { createSolvedCubeState } from '@/domains/cube/cubeState';
import {
  cubeJsStringToCubeState,
  cubeStateToCubeJsString,
} from '@/domains/cube/cubeStateToFacelets';

describe('cubeJsStringToCubeState', () => {
  it('round-trips solved cube with cubejs alphabet', () => {
    const s = createSolvedCubeState();
    const str = cubeStateToCubeJsString(s);
    expect(str.length).toBe(54);
    expect(cubeJsStringToCubeState(str)).toEqual(s);
  });
});
