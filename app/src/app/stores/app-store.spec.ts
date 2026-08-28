import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import type { PlatformPort } from '@/application/ports/platform'
import { useAppStore } from './app-store'

describe('app store platform information', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('exposes information returned by the selected host', async () => {
    const platform: PlatformPort = {
      async getAppInfo() {
        return { name: '百草药园', version: '0.1.0', runtime: 'tauri' }
      },
    }
    const store = useAppStore()

    await store.loadAppInfo(platform)

    expect(store.appInfo).toEqual({ name: '百草药园', version: '0.1.0', runtime: 'tauri' })
  })
})
