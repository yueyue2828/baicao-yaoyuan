import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDisplayStore } from './display-store'

describe('display store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('clamps UI scale to 80–200 percent', () => {
    const store = useDisplayStore()

    store.setUiScale(30)
    expect(store.uiScalePercent).toBe(80)

    store.setUiScale(250)
    expect(store.uiScalePercent).toBe(200)
  })

  it('rounds a supported scale before exposing its CSS ratio', () => {
    const store = useDisplayStore()

    store.setUiScale(112.6)

    expect(store.uiScalePercent).toBe(113)
    expect(store.cssScale).toBe(1.13)
  })
})
