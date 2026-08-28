import { describe, expect, it } from 'vitest'
import { FixedClock, SystemClock } from './clock'

describe('Clock', () => {
  it('returns and advances a deterministic time in tests', () => {
    const clock = new FixedClock(123456)

    expect(clock.nowMs()).toBe(123456)
    clock.advanceMs(250)
    expect(clock.nowMs()).toBe(123706)
  })

  it('uses the injected system function', () => {
    expect(new SystemClock(() => 42).nowMs()).toBe(42)
  })
})
