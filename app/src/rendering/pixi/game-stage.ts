import { Application, Container } from 'pixi.js'
import { computeSafeViewport } from './viewport'

export type GameLayerName = 'background' | 'world' | 'actors' | 'effects' | 'hud'

export interface GameStage {
  layers: Record<GameLayerName, Container>
  resize(width: number, height: number): void
  destroy(): void
}

export async function createGameStage(host: HTMLElement): Promise<GameStage> {
  const app = new Application()
  await app.init({ backgroundAlpha: 0, antialias: true, resizeTo: host })
  host.appendChild(app.canvas)

  const layers = {
    background: new Container({ label: 'background' }),
    world: new Container({ label: 'world' }),
    actors: new Container({ label: 'actors' }),
    effects: new Container({ label: 'effects' }),
    hud: new Container({ label: 'hud' }),
  }
  app.stage.addChild(...Object.values(layers))

  return {
    layers,
    resize(width, height) {
      const viewport = computeSafeViewport(width, height)
      app.stage.scale.set(viewport.scale)
      app.stage.position.set(viewport.offsetX, viewport.offsetY)
    },
    destroy() {
      app.destroy(true, { children: true, texture: true })
    },
  }
}
