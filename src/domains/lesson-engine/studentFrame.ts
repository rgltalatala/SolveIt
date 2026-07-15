import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type CubeState,
  type Move,
} from '@/domains/cube/cubeState';

/** Solved cube in lesson student frame (yellow U, blue F, white D). */
export function solvedStudentFrameCube(): CubeState {
  return cubeStateToStudentFrame(createSolvedCubeState());
}

/** Apply setup moves from a solved student-frame cube. */
export function studentFrameFromSetupMoves(moves: readonly Move[]): CubeState {
  return applyMoves(solvedStudentFrameCube(), [...moves]);
}
