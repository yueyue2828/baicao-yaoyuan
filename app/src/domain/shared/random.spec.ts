import { describe, expect, it } from 'vitest'
import { XorShift32 } from './random'

describe('XorShift32', () => {
  it('matches the hand-checked first step for seed 1', () => {
    const rng = new XorShift32(1)

    expect(rng.nextFloat()).toBe(270369 / 0x1_0000_0000)
    expect(rng.getState()).toBe(270369)
  })

  it('repeats the same sequence for the same seed', () => {
    const a = new XorShift32(20260828)
    const b = new XorShift32(20260828)

    expect([a.nextFloat(), a.nextFloat(), a.nextFloat()]).toEqual([
      b.nextFloat(),
      b.nextFloat(),
      b.nextFloat(),
    ])
  })

  it('restores an exact saved state', () => {
    const rng = new XorShift32(7)
    rng.nextFloat()
    const saved = rng.getState()
    const expected = rng.nextFloat()

    rng.setState(saved)

    expect(rng.nextFloat()).toBe(expected)
  })

  it('always returns a value in [0, 1)', () => {
    const rng = new XorShift32(99)

    for (let i = 0; i < 1000; i += 1) {
      const value = rng.nextFloat()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
