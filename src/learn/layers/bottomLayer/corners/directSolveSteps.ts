import { applyMoves } from '../../../../cube/cubeState'
import type { CubeState, Face, Move } from '../../../../cube/cubeState'
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg'
import { recognizeCornerCaseInFrdView } from './cornerCases'
import {
  cornerDemoChangesState,
  findVerifiedCornerDemoForCornerId,
  findVerifiedCornerDemoForCornerIdAsync,
  type CornerBfsSearchConfig,
} from './cornerSolveBfs'
import { verifiedFrdDemoAtHold, studentHoldView } from './frdViewDemoBuild'
import { formatColor, formatCornerLabel } from './cornerSlotModel'
import type { CornerSlotId, WhiteCornersLessonStep } from './types'
import { buildFrdULayerDemo } from './uLayerSteps'
import { buildFrdWrongDLayerDemo } from './wrongDLayerSteps'
import { U_LAYER_U_PREFIXES } from './uLayerSteps'

export const FRD_WHITE_ON_F: Move[] = parseFaceTurnAlgToMoves("R U' R' U R U' R'")
export const FRD_WHITE_ON_R: Move[] = parseFaceTurnAlgToMoves("R U R' U' R U R'")

const FRD_TWIST_FALLBACK_DEMOS: Move[][] = [
  FRD_WHITE_ON_F,
  FRD_WHITE_ON_R,
  parseFaceTurnAlgToMoves("R U R' R U' R'"),
  [...FRD_WHITE_ON_R, ...FRD_WHITE_ON_F],
  [...FRD_WHITE_ON_F, ...FRD_WHITE_ON_R],
]

function demoForFrdTwist(whiteOnFace: Face): Move[] | null {
  if (whiteOnFace === 'F') return FRD_WHITE_ON_F
  if (whiteOnFace === 'R') return FRD_WHITE_ON_R
  return null
}

function buildTwistedInSlotStep(
  studentState: CubeState,
  cornerId: CornerSlotId,
  whiteOnFace: Face,
  demo: Move[],
): WhiteCornersLessonStep {
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: `The ${formatCornerLabel(cornerId).toLowerCase()} is in the front-right slot but twisted—white is on the ${formatColor(studentState[whiteOnFace][4])} (${whiteOnFace}) face instead of the bottom. Use the demo to orient white onto D while keeping your white cross and any corners you already solved intact.`,
    demoMoves: demo,
  }
}

function buildULayerInsertStep(
  cornerId: CornerSlotId,
  demo: Move[],
): WhiteCornersLessonStep {
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: `The ${formatCornerLabel(cornerId).toLowerCase()} piece is on the top layer. The demo lines it up above the front-right slot (URF), then inserts it with white on the bottom. Your white cross and any corners you already solved stay intact.`,
    demoMoves: demo,
  }
}

function buildWrongDLayerStep(
  cornerId: CornerSlotId,
  demo: Move[],
): WhiteCornersLessonStep {
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: `The ${formatCornerLabel(cornerId).toLowerCase()} piece is in the wrong bottom corner slot. The demo extracts it to the top (URF), then inserts it with white on the bottom. Your white cross and any corners you already solved stay intact.`,
    demoMoves: demo,
  }
}

function buildBfsFallbackStep(cornerId: CornerSlotId, demo: Move[]): WhiteCornersLessonStep {
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: `Slot the ${formatCornerLabel(cornerId).toLowerCase()} using the demo while keeping your white cross and any corners you already solved intact.`,
    demoMoves: demo,
  }
}

export function tryFrdTwistedInSlot(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  for (const uPrefix of U_LAYER_U_PREFIXES) {
    const viewState = studentHoldView(studentState, holdIndex, uPrefix)
    const cornerCase = recognizeCornerCaseInFrdView(viewState, id, holdIndex)
    if (cornerCase.kind !== 'in-slot-twisted') continue

    const twistDemos = [
      demoForFrdTwist(cornerCase.whiteOnFace),
      cornerCase.whiteOnFace === 'F' ? FRD_WHITE_ON_R : FRD_WHITE_ON_F,
    ].filter((demo): demo is Move[] => !!demo?.length)

    for (const twist of twistDemos) {
      const baseDemo = [...uPrefix, ...twist]
      const demo = verifiedFrdDemoAtHold(
        studentState,
        id,
        holdIndex,
        baseDemo,
        solvedCornerIds,
      )
      if (!demo) continue
      return buildTwistedInSlotStep(studentState, id, cornerCase.whiteOnFace, demo)
    }
  }

  return null
}

/** Last-resort fixed algs: try FRD twist inserts whenever they verify (e.g. wrong-D slot twist). */
export function tryFrdTwistAlgFallback(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  for (const uPrefix of U_LAYER_U_PREFIXES) {
    for (const twist of FRD_TWIST_FALLBACK_DEMOS) {
      const baseDemo = [...uPrefix, ...twist]
      const viewState = studentHoldView(studentState, holdIndex, uPrefix)
      const cornerCase = recognizeCornerCaseInFrdView(viewState, id, holdIndex)
      const demo = verifiedFrdDemoAtHold(
        studentState,
        id,
        holdIndex,
        baseDemo,
        solvedCornerIds,
      )
      if (!demo) continue
      const whiteOnFace =
        cornerCase.kind === 'in-slot-twisted' ? cornerCase.whiteOnFace : 'F'
      return buildTwistedInSlotStep(studentState, id, whiteOnFace, demo)
    }
  }
  return null
}

export function tryFrdULayerInsert(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  const demo = buildFrdULayerDemo(studentState, 'URF', id, holdIndex, solvedCornerIds)
  if (!demo?.length) return null

  return buildULayerInsertStep(id, demo)
}

export function tryFrdWrongDLayerExtract(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  const demo = buildFrdWrongDLayerDemo(studentState, 'FRD', id, holdIndex, solvedCornerIds)
  if (!demo?.length) return null

  return buildWrongDLayerStep(id, demo)
}

function shortestVerifiedDemo(candidates: (Move[] | null | undefined)[]): Move[] | null {
  let best: Move[] | null = null
  for (const demo of candidates) {
    if (!demo?.length) continue
    if (!best || demo.length < best.length) best = demo
  }
  return best
}

function collectTwistedDemos(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: number,
  solvedCornerIds?: readonly CornerSlotId[],
): Move[][] {
  const found: Move[][] = []
  for (const uPrefix of U_LAYER_U_PREFIXES) {
    const viewState = studentHoldView(studentState, holdIndex, uPrefix)
    const cornerCase = recognizeCornerCaseInFrdView(viewState, id, holdIndex)
    if (cornerCase.kind !== 'in-slot-twisted') continue

    const twistDemos = [
      demoForFrdTwist(cornerCase.whiteOnFace),
      cornerCase.whiteOnFace === 'F' ? FRD_WHITE_ON_R : FRD_WHITE_ON_F,
    ].filter((demo): demo is Move[] => !!demo?.length)

    for (const twist of twistDemos) {
      const demo = verifiedFrdDemoAtHold(
        studentState,
        id,
        holdIndex,
        [...uPrefix, ...twist],
        solvedCornerIds,
      )
      if (demo) found.push(demo)
    }
  }
  return found
}

function collectTwistFallbackDemos(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: number,
  solvedCornerIds?: readonly CornerSlotId[],
): Move[][] {
  const found: Move[][] = []
  for (const uPrefix of U_LAYER_U_PREFIXES) {
    for (const twist of FRD_TWIST_FALLBACK_DEMOS) {
      const viewState = studentHoldView(studentState, holdIndex, uPrefix)
      const cornerCase = recognizeCornerCaseInFrdView(viewState, id, holdIndex)
      const demo = verifiedFrdDemoAtHold(
        studentState,
        id,
        holdIndex,
        [...uPrefix, ...twist],
        solvedCornerIds,
      )
      if (demo) found.push(demo)
    }
  }
  return found
}

function collectShortestFixedDemo(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): Move[] | null {
  return shortestVerifiedDemo(
    [
      buildFrdULayerDemo(studentState, 'URF', id, holdIndex, solvedCornerIds),
      buildFrdWrongDLayerDemo(studentState, 'FRD', id, holdIndex, solvedCornerIds),
      ...collectTwistedDemos(studentState, id, holdIndex, solvedCornerIds),
      ...collectTwistFallbackDemos(studentState, id, holdIndex, solvedCornerIds),
    ].filter((demo): demo is Move[] => !!demo?.length),
  )
}

function demosEqual(a: readonly Move[], b: readonly Move[]): boolean {
  return a.length === b.length && a.every((move, index) => move === b[index])
}

function buildStepForDemo(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: number,
  demo: Move[],
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep {
  const uDemo = buildFrdULayerDemo(studentState, 'URF', id, holdIndex, solvedCornerIds)
  if (uDemo && demosEqual(uDemo, demo)) return buildULayerInsertStep(id, demo)

  const wDemo = buildFrdWrongDLayerDemo(studentState, 'FRD', id, holdIndex, solvedCornerIds)
  if (wDemo && demosEqual(wDemo, demo)) return buildWrongDLayerStep(id, demo)

  for (const uPrefix of U_LAYER_U_PREFIXES) {
    const viewState = studentHoldView(studentState, holdIndex, uPrefix)
    const cornerCase = recognizeCornerCaseInFrdView(viewState, id, holdIndex)
    if (cornerCase.kind === 'in-slot-twisted') {
      for (const twist of [
        demoForFrdTwist(cornerCase.whiteOnFace),
        cornerCase.whiteOnFace === 'F' ? FRD_WHITE_ON_R : FRD_WHITE_ON_F,
      ]) {
        if (!twist) continue
        const verified = verifiedFrdDemoAtHold(
          studentState,
          id,
          holdIndex,
          [...uPrefix, ...twist],
          solvedCornerIds,
        )
        if (verified && demosEqual(verified, demo)) {
          return buildTwistedInSlotStep(studentState, id, cornerCase.whiteOnFace, demo)
        }
      }
    }
  }

  for (const uPrefix of U_LAYER_U_PREFIXES) {
    for (const twist of FRD_TWIST_FALLBACK_DEMOS) {
      const viewState = studentHoldView(studentState, holdIndex, uPrefix)
      const cornerCase = recognizeCornerCaseInFrdView(viewState, id, holdIndex)
      const verified = verifiedFrdDemoAtHold(
        studentState,
        id,
        holdIndex,
        [...uPrefix, ...twist],
        solvedCornerIds,
      )
      if (!verified || !demosEqual(verified, demo)) continue
      const whiteOnFace =
        cornerCase.kind === 'in-slot-twisted' ? cornerCase.whiteOnFace : 'F'
      return buildTwistedInSlotStep(studentState, id, whiteOnFace, demo)
    }
  }

  return buildBfsFallbackStep(id, demo)
}

export function tryDirectSolveStepForCornerId(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
  cornerBfsSearch?: CornerBfsSearchConfig,
): WhiteCornersLessonStep | null {
  const fixedDemo = collectShortestFixedDemo(studentState, id, holdIndex, solvedCornerIds)
  if (fixedDemo?.length && cornerDemoChangesState(studentState, fixedDemo)) {
    return buildStepForDemo(studentState, id, holdIndex, fixedDemo, solvedCornerIds)
  }

  if (cornerBfsSearch === undefined) return null

  const bfsDemo = findVerifiedCornerDemoForCornerId(
    studentState,
    id,
    holdIndex,
    cornerBfsSearch,
    solvedCornerIds,
  )
  if (!bfsDemo?.length || !cornerDemoChangesState(studentState, bfsDemo)) return null

  return buildStepForDemo(studentState, id, holdIndex, bfsDemo, solvedCornerIds)
}

export async function tryDirectSolveStepForCornerIdAsync(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
  cornerBfsSearch?: CornerBfsSearchConfig,
): Promise<WhiteCornersLessonStep | null> {
  const fixedDemo = collectShortestFixedDemo(studentState, id, holdIndex, solvedCornerIds)
  if (fixedDemo?.length && cornerDemoChangesState(studentState, fixedDemo)) {
    return buildStepForDemo(studentState, id, holdIndex, fixedDemo, solvedCornerIds)
  }

  if (cornerBfsSearch === undefined) return null

  const bfsDemo = await findVerifiedCornerDemoForCornerIdAsync(
    studentState,
    id,
    holdIndex,
    cornerBfsSearch,
    solvedCornerIds,
  )
  if (!bfsDemo?.length || !cornerDemoChangesState(studentState, bfsDemo)) return null

  return buildStepForDemo(studentState, id, holdIndex, bfsDemo, solvedCornerIds)
}
