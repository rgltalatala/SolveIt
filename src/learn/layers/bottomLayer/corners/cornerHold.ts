import { applyMoves } from '../../../../cube/cubeState'
import type { Color, CubeState, Move } from '../../../../cube/cubeState'
import type { CornerSlotId } from './types'

export type CornerHoldIndex = 0 | 1 | 2 | 3

export const CORNER_HOLD_INDEX: Record<CornerSlotId, CornerHoldIndex> = {
  FRD: 0,
  BDR: 1,
  BLD: 2,
  FDL: 3,
}

const DELTA_TO_Y: Move[][] = [[], ['y'], ['y2'], ["y'"]]

const HOLD_FACE_COLORS: Record<CornerHoldIndex, Color> = {
  0: 'blue',
  1: 'red',
  2: 'green',
  3: 'orange',
}

export function targetHoldIndex(cornerId: CornerSlotId): CornerHoldIndex {
  return CORNER_HOLD_INDEX[cornerId]
}

/** Absolute y from blue-front hold (index 0) to the given hold index. */
export function holdIndexToY(index: CornerHoldIndex): Move[] {
  return DELTA_TO_Y[index]!
}

/** y rotation(s) from one hold index to another (mod 4). */
export function relativeY(fromIndex: number, toIndex: number): Move[] {
  const delta = ((toIndex - fromIndex) % 4 + 4) % 4
  return DELTA_TO_Y[delta]!
}

export function returnToBlueY(fromIndex: CornerHoldIndex): Move[] {
  return relativeY(fromIndex, 0)
}

export function faceColorAtHold(index: CornerHoldIndex): Color {
  return HOLD_FACE_COLORS[index]
}

export function normalizeHoldToBlue(state: CubeState, holdIndex: number): CubeState {
  if (holdIndex === 0) return state
  return applyMoves(state, relativeY(holdIndex, 0))
}

/** Cube state as viewed after rotating to the given hold from blue front. */
export function stateAtHold(state: CubeState, holdIndex: CornerHoldIndex): CubeState {
  if (holdIndex === 0) return state
  return applyMoves(state, holdIndexToY(holdIndex))
}

export function formatHoldFaceLabel(index: CornerHoldIndex): string {
  const color = faceColorAtHold(index)
  return color.charAt(0).toUpperCase() + color.slice(1)
}

/**
 * FRD-view corner demos are authored at blue-front hold (0). Wrap so the same
 * algorithm applies when the student has already reoriented to another hold.
 */
export function frdViewDemoAtHold(baseDemo: Move[], holdIndex: number): Move[] {
  if (holdIndex === 0) return baseDemo
  const h = holdIndex as CornerHoldIndex
  return [...relativeY(h, 0), ...baseDemo, ...holdIndexToY(h)]
}

/** Net quarter-turn hold change from whole-cube y moves in a demo (mod 4). */
export function netYDeltaFromDemo(moves: readonly Move[]): number {
  let delta = 0
  for (const m of moves) {
    if (m === 'y') delta = (delta + 1) % 4
    else if (m === "y'") delta = (delta + 3) % 4
    else if (m === 'y2') delta = (delta + 2) % 4
  }
  return delta
}

export function applyHoldDelta(holdIndex: number, delta: number): CornerHoldIndex {
  return (((holdIndex + delta) % 4) + 4) % 4 as CornerHoldIndex
}
