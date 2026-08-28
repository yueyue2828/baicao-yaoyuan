import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGameStage } from '@/rendering/pixi/game-stage'
import PixiStage from './PixiStage.vue'

vi.mock('@/rendering/pixi/game-stage', () => ({ createGameStage: vi.fn() }))

const createGameStageMock = vi.mocked(createGameStage)

describe('PixiStage', () => {
  const resize = vi.fn()
  const destroy = vi.fn()
  const disconnect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    createGameStageMock.mockResolvedValue({
      layers: {} as Awaited<ReturnType<typeof createGameStage>>['layers'],
      resize,
      destroy,
    })

    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: ResizeObserverCallback) {}

        observe() {
          this.callback(
            [{ contentRect: { width: 1024, height: 768 } } as ResizeObserverEntry],
            this as unknown as ResizeObserver,
          )
        }

        disconnect = disconnect
      },
    )
  })

  it('resizes the stage and releases it exactly once on unmount', async () => {
    const wrapper = mount(PixiStage)
    await flushPromises()

    expect(wrapper.get('[role="img"]').attributes('aria-label')).toBe('自动战斗场景')
    expect(resize).toHaveBeenCalledWith(1024, 768)

    wrapper.unmount()

    expect(disconnect).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledOnce()
  })
})
