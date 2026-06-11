import type { Move } from '../../../../cube/cubeState'
import { isWholeCubeRotation } from '../../../../cube/cubeState'
import { noneHold, translateMove, type StudentHold } from '../../../studentHold'
import type { YHold } from '../../../studentHold/types'
import { holdIndexToY, relativeY, type CornerHoldIndex } from './cornerHold'

function studentHoldFromCornerHoldIndex(index: CornerHoldIndex): StudentHold {
  if (index === 0) return noneHold()
  const yRot = holdIndexToY(index)[0]
  return { y: yRot as YHold }
}

function movesMatchPrefix(demo: Move[], prefix: Move[]): boolean {
  if (prefix.length > demo.length) return false
  return prefix.every((m, i) => demo[i] === m)
}

/** Strip y/y' bookends from storage demos produced by {@link frdViewDemoAtHold}. */
export function unwrapStorageDemoForHold(
  demo: Move[],
  holdIndex: CornerHoldIndex,
): Move[] {
  if (holdIndex === 0) return demo
  const prefix = relativeY(holdIndex, 0)
  const suffix = holdIndexToY(holdIndex)
  if (
    prefix.length + suffix.length <= demo.length &&
    movesMatchPrefix(demo, prefix) &&
    movesMatchPrefix(demo.slice(demo.length - suffix.length), suffix)
  ) {
    return demo.slice(prefix.length, demo.length - suffix.length)
  }
  return demo
}

/**
 * Face-turn labels as the student sees them at the current hold (for demo preview).
 * Storage/application demos stay in blue-front frame; only the UI view is translated.
 */
export function translateDemoForHoldView(
  demo: Move[],
  holdIndex: CornerHoldIndex,
): Move[] {
  if (holdIndex === 0) return demo
  const inner = unwrapStorageDemoForHold(demo, holdIndex)
  const hold = studentHoldFromCornerHoldIndex(holdIndex)
  return inner.map((m) => (isWholeCubeRotation(m) ? m : translateMove(m, hold)))
}
