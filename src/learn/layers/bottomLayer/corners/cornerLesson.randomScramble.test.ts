import { describe, expect, it } from 'vitest'
import { randomScrambleForEvent } from 'cubing/scramble'
import { applyMoves, createSolvedCubeState } from '../../../../cube/cubeState'
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg'
import { validateCubeState } from '../../../../cube/cubeValidator'
import { simulateWhiteCrossLessonOnStorageCube } from '../cross/index'
import { simulateWhiteCornersLessonOnStorageCubeAsync } from './index'

describe('white corners lesson vs cubing.js random scrambles', () => {
  it(
    'lesson demos eventually complete the white corners after solving the cross on several random WCA scrambles',
    async () => {
      const iterations = 8
      for (let i = 0; i < iterations; i += 1) {
        const alg = await randomScrambleForEvent('333')
        const algStr = alg.toString().replace(/\u2032/g, "'")
        const moves = parseFaceTurnAlgToMoves(algStr)
        const storage = applyMoves(createSolvedCubeState(), moves)
        const v = validateCubeState(storage)
        expect(v.valid, `cube invalid iter ${i}: ${v.issues.map((x) => x.message).join('; ')}`).toBe(true)

        const cross = simulateWhiteCrossLessonOnStorageCube(storage, 150)
        expect(
          cross.stuckNoDemo,
          `cross stuck without demo iter ${i}, lastKind=${cross.lastStepKind} alg=${algStr}`,
        ).toBe(false)
        expect(
          cross.crossComplete,
          `cross incomplete iter ${i}, steps=${cross.lessonStepsSimulated} alg=${algStr}`,
        ).toBe(true)

        const corners = await simulateWhiteCornersLessonOnStorageCubeAsync(
          cross.finalStorageCube,
          300,
        )
        expect(
          corners.stuckNoDemo,
          `corners stuck without demo iter ${i}, lastKind=${corners.lastStepKind} crossSteps=${cross.lessonStepsSimulated} alg=${algStr}`,
        ).toBe(false)
        expect(
          corners.cornersComplete,
          `corners incomplete iter ${i}, steps=${corners.lessonStepsSimulated} crossSteps=${cross.lessonStepsSimulated} alg=${algStr}`,
        ).toBe(true)
        expect(corners.finalHoldIndex).toBe(0)
      }
    },
    600_000,
  )
})
