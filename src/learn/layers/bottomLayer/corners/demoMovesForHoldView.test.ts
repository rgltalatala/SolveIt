import { describe, expect, it } from 'vitest'
import {
  translateDemoForHoldView,
  unwrapStorageDemoForHold,
} from './demoMovesForHoldView'

describe('demoMovesForHoldView', () => {
  it('translates blue-front B U B prime to R U R prime at red-front hold', () => {
    expect(translateDemoForHoldView(['B', 'U', "B'"], 1)).toEqual(['R', 'U', "R'"])
  })

  it('leaves demos unchanged at blue-front hold', () => {
    expect(translateDemoForHoldView(['R', 'U', "R'"], 0)).toEqual(['R', 'U', "R'"])
  })

  it('unwraps y-wrapped storage demos before translating', () => {
    const wrapped = ["y'", 'B', 'U', "B'", 'y'] as const
    expect(unwrapStorageDemoForHold([...wrapped], 1)).toEqual(['B', 'U', "B'"])
    expect(translateDemoForHoldView([...wrapped], 1)).toEqual(['R', 'U', "R'"])
  })
})
