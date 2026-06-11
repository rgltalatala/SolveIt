import { applyMoves } from '../../../../cube/cubeState'
import type { CubeState, Move } from '../../../../cube/cubeState'
import { cubeStateToCubeJsString } from '../../../../cube/cubeStateToFacelets'
import {
  bfsShortestPath,
  bfsShortestPathAsync,
  createDemoCache,
  registerLessonDemoCache,
} from '../../../lessonCore'
import { isWhiteCrossComplete } from '../cross/crossSlotModel'
import {
  cornerPreservedAtLessonHold,
  cornerTargetSolvedAtHold,
} from './preserveLessonState'
import { mustPreserveCornerIds } from './cornerSlotModel'
import { isVerifiedCornerSlotDemo } from './preserveLessonState'
import type { CornerSlotId } from './types'

export type CornerSlotSolveSearchOptions = {
  maxDepth?: number
  maxSeen?: number
}

/** Interactive lesson / UI: shallow tiers with a wall-clock cap (matches cross depth). */
export const INTERACTIVE_CORNER_SEARCH_TIERS: CornerSlotSolveSearchOptions[] = [
  { maxDepth: 16, maxSeen: 80_000 },
  { maxDepth: 22, maxSeen: 160_000 },
  { maxDepth: 28, maxSeen: 400_000 },
]

/** CI / simulation: deeper tiers when fixed algs and interactive BFS miss. */
export const EXHAUSTIVE_CORNER_SEARCH_TIERS: CornerSlotSolveSearchOptions[] = [
  ...INTERACTIVE_CORNER_SEARCH_TIERS,
  { maxDepth: 40, maxSeen: 1_200_000 },
  { maxDepth: 50, maxSeen: 2_000_000 },
]

export const INTERACTIVE_CORNER_BFS_MAX_MS = 2_000

export type CornerBfsSearchConfig = {
  searchTiers?: CornerSlotSolveSearchOptions[]
  maxMs?: number
}

export const INTERACTIVE_CORNER_BFS_CONFIG: CornerBfsSearchConfig = {
  searchTiers: INTERACTIVE_CORNER_SEARCH_TIERS,
  maxMs: INTERACTIVE_CORNER_BFS_MAX_MS,
}

export const EXHAUSTIVE_CORNER_BFS_CONFIG: CornerBfsSearchConfig = {
  searchTiers: EXHAUSTIVE_CORNER_SEARCH_TIERS,
}

export const CORNER_SOLVE_BFS_MOVES: Move[] = [
  'U',
  "U'",
  'U2',
  'D',
  "D'",
  'D2',
  'F',
  "F'",
  'F2',
  'B',
  "B'",
  'B2',
  'L',
  "L'",
  'L2',
  'R',
  "R'",
  'R2',
]

const VERIFIED_CORNER_DEMO_CACHE_MAX = 128
const verifiedCornerDemoCache = createDemoCache<string>(VERIFIED_CORNER_DEMO_CACHE_MAX)

registerLessonDemoCache(() => verifiedCornerDemoCache.clear())

export function clearVerifiedCornerDemoCache(): void {
  verifiedCornerDemoCache.clear()
}

function bfsSearchCacheSuffix(bfsSearch: CornerBfsSearchConfig): string {
  const tiers = bfsSearch.searchTiers ?? INTERACTIVE_CORNER_SEARCH_TIERS
  const tierSig = tiers.map((t) => `${t.maxDepth ?? ''}:${t.maxSeen ?? ''}`).join(',')
  return `${bfsSearch.maxMs ?? 'inf'}:${tierSig}`
}

function verifiedCornerDemoCacheKey(
  studentState: CubeState,
  targetId: CornerSlotId,
  holdIndex: number,
  bfsSearch: CornerBfsSearchConfig,
  solvedCornerIds?: readonly CornerSlotId[],
): string {
  const solvedKey = (solvedCornerIds ?? []).join(',')
  return `${cubeStateToCubeJsString(studentState)}:${targetId}:${holdIndex}:${solvedKey}:${bfsSearchCacheSuffix(bfsSearch)}`
}

function cornerSlotGoalState(
  state: CubeState,
  targetId: CornerSlotId,
  holdIndex: number,
  initialStudent: CubeState,
  solvedCornerIds?: readonly CornerSlotId[],
): boolean {
  if (!isWhiteCrossComplete(state)) return false
  const mustPreserve = mustPreserveCornerIds(
    initialStudent,
    targetId,
    holdIndex,
    solvedCornerIds,
  )
  return (
    cornerTargetSolvedAtHold(state, targetId, holdIndex) &&
    mustPreserve.every((id) => cornerPreservedAtLessonHold(state, id, holdIndex))
  )
}

function remainingBfsBudgetMs(
  searchStartedAt: number,
  maxMs: number | undefined,
): number | undefined {
  if (maxMs === undefined) return undefined
  return Math.max(0, maxMs - (Date.now() - searchStartedAt))
}

export function bfsSolveCornerPreservingOthers(
  studentState: CubeState,
  targetId: CornerSlotId,
  holdIndex: number,
  options: CornerSlotSolveSearchOptions & { maxMs?: number } = {},
  solvedCornerIds?: readonly CornerSlotId[],
): Move[] | null {
  return bfsShortestPath(
    studentState,
    (state) =>
      cornerSlotGoalState(state, targetId, holdIndex, studentState, solvedCornerIds),
    {
      moves: CORNER_SOLVE_BFS_MOVES,
      maxDepth: options.maxDepth,
      maxSeen: options.maxSeen,
      maxMs: options.maxMs,
    },
  )
}

export async function bfsSolveCornerPreservingOthersAsync(
  studentState: CubeState,
  targetId: CornerSlotId,
  holdIndex: number,
  options: CornerSlotSolveSearchOptions & { maxMs?: number } = {},
  solvedCornerIds?: readonly CornerSlotId[],
): Promise<Move[] | null> {
  return bfsShortestPathAsync(
    studentState,
    (state) =>
      cornerSlotGoalState(state, targetId, holdIndex, studentState, solvedCornerIds),
    {
      moves: CORNER_SOLVE_BFS_MOVES,
      maxDepth: options.maxDepth,
      maxSeen: options.maxSeen,
      maxMs: options.maxMs,
    },
  )
}

function cacheVerifiedCornerDemo(
  cacheKey: string,
  demo: Move[] | null,
  cacheMisses: boolean,
): Move[] | null {
  if (demo) verifiedCornerDemoCache.set(cacheKey, demo)
  else if (cacheMisses) verifiedCornerDemoCache.set(cacheKey, demo)
  return demo
}

function resolveCornerBfsSearchConfig(
  config: CornerBfsSearchConfig = INTERACTIVE_CORNER_BFS_CONFIG,
): Required<Pick<CornerBfsSearchConfig, 'searchTiers'>> &
  Pick<CornerBfsSearchConfig, 'maxMs'> {
  return {
    searchTiers: config.searchTiers ?? INTERACTIVE_CORNER_SEARCH_TIERS,
    maxMs: config.maxMs,
  }
}

export function findVerifiedCornerDemoForCornerId(
  studentState: CubeState,
  targetId: CornerSlotId,
  holdIndex = 0,
  bfsSearch: CornerBfsSearchConfig = INTERACTIVE_CORNER_BFS_CONFIG,
  solvedCornerIds?: readonly CornerSlotId[],
): Move[] | null {
  const { searchTiers, maxMs } = resolveCornerBfsSearchConfig(bfsSearch)
  const cacheMisses = maxMs === undefined
  const cacheKey = verifiedCornerDemoCacheKey(
    studentState,
    targetId,
    holdIndex,
    bfsSearch,
    solvedCornerIds,
  )
  if (verifiedCornerDemoCache.has(cacheKey)) {
    return verifiedCornerDemoCache.get(cacheKey) ?? null
  }

  const searchStartedAt = Date.now()
  for (const tier of searchTiers) {
    if (remainingBfsBudgetMs(searchStartedAt, maxMs) === 0) break

    const demo = bfsSolveCornerPreservingOthers(
      studentState,
      targetId,
      holdIndex,
      {
        ...tier,
        maxMs: remainingBfsBudgetMs(searchStartedAt, maxMs),
      },
      solvedCornerIds,
    )
    if (
      demo?.length &&
      isVerifiedCornerSlotDemo(
        studentState,
        targetId,
        demo,
        holdIndex,
        solvedCornerIds,
      )
    ) {
      return cacheVerifiedCornerDemo(cacheKey, demo, cacheMisses)
    }
  }
  return cacheVerifiedCornerDemo(cacheKey, null, cacheMisses)
}

export async function findVerifiedCornerDemoForCornerIdAsync(
  studentState: CubeState,
  targetId: CornerSlotId,
  holdIndex = 0,
  bfsSearch: CornerBfsSearchConfig = INTERACTIVE_CORNER_BFS_CONFIG,
  solvedCornerIds?: readonly CornerSlotId[],
): Promise<Move[] | null> {
  const { searchTiers, maxMs } = resolveCornerBfsSearchConfig(bfsSearch)
  const cacheMisses = maxMs === undefined
  const cacheKey = verifiedCornerDemoCacheKey(
    studentState,
    targetId,
    holdIndex,
    bfsSearch,
    solvedCornerIds,
  )
  if (verifiedCornerDemoCache.has(cacheKey)) {
    return verifiedCornerDemoCache.get(cacheKey) ?? null
  }

  const searchStartedAt = Date.now()
  for (const tier of searchTiers) {
    if (remainingBfsBudgetMs(searchStartedAt, maxMs) === 0) break

    const demo = await bfsSolveCornerPreservingOthersAsync(
      studentState,
      targetId,
      holdIndex,
      {
        ...tier,
        maxMs: remainingBfsBudgetMs(searchStartedAt, maxMs),
      },
      solvedCornerIds,
    )
    if (
      demo?.length &&
      isVerifiedCornerSlotDemo(
        studentState,
        targetId,
        demo,
        holdIndex,
        solvedCornerIds,
      )
    ) {
      return cacheVerifiedCornerDemo(cacheKey, demo, cacheMisses)
    }
  }
  return cacheVerifiedCornerDemo(cacheKey, null, cacheMisses)
}

/** True when a demo actually changes the student frame (mirrors cross direct-solve guard). */
export function cornerDemoChangesState(studentState: CubeState, demo: Move[]): boolean {
  const after = applyMoves(studentState, demo)
  return JSON.stringify(after) !== JSON.stringify(studentState)
}
