import { describe, expect, it } from 'vitest'
import { computeSafeViewport } from './viewport'

describe('computeSafeViewport', () => {
  it('fits 1280×720 exactly', () => {
    expect(computeSafeViewport(1280, 720)).toEqual({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      visibleWidth: 1280,
      visibleHeight: 720,
    })
  })

  it('letterboxes a 4:3 container without clipping the safe area', () => {
    const result = computeSafeViewport(1024, 768)

    expect(result.scale).toBe(0.8)
    expect(result.offsetY).toBe(96)
  })

  it('extends the visible width on ultrawide screens', () => {
    expect(computeSafeViewport(3440, 1440).visibleWidth).toBe(1720)
  })
})
