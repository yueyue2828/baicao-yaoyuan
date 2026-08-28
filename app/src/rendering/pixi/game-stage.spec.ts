import { beforeEach, describe, expect, it, vi } from 'vitest'

const pixiSpies = vi.hoisted(() => ({
  init: vi.fn(),
  destroy: vi.fn(),
  setScale: vi.fn(),
  setPosition: vi.fn(),
}))

vi.mock('pixi.js', () => {
  class Container {
    label: string
    children: Container[] = []
    scale = { set: pixiSpies.setScale }
    position = { set: pixiSpies.setPosition }

    constructor(options: { label?: string } = {}) {
      this.label = options.label ?? ''
    }

    addChild(...children: Container[]) {
      this.children.push(...children)
    }
  }

  class Application {
    canvas = document.createElement('canvas')
    stage = new Container()
    init = pixiSpies.init
    destroy = pixiSpies.destroy
  }

  return { Application, Container }
})

import { createGameStage } from './game-stage'

describe('createGameStage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates layers in stable rendering order', async () => {
    const host = document.createElement('div')
    const stage = await createGameStage(host)

    expect(Object.keys(stage.layers)).toEqual([
      'background',
      'world',
      'actors',
      'effects',
      'hud',
    ])
    expect(host.querySelector('canvas')).not.toBeNull()
  })

  it('positions the safe area when resized to a 4:3 host', async () => {
    const stage = await createGameStage(document.createElement('div'))

    stage.resize(1024, 768)

    expect(pixiSpies.setScale).toHaveBeenCalledWith(0.8)
    expect(pixiSpies.setPosition).toHaveBeenCalledWith(0, 96)
  })

  it('releases the Pixi application when destroyed', async () => {
    const stage = await createGameStage(document.createElement('div'))

    stage.destroy()

    expect(pixiSpies.destroy).toHaveBeenCalledOnce()
  })
})
