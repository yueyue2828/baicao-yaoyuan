import type { PlatformPort } from '@/application/ports/platform'
import { createTauriPlatform } from './tauri'

export function createBrowserPlatform(): PlatformPort {
  return {
    async getAppInfo() {
      return { name: '百草药园', version: 'development', runtime: 'browser' }
    },
  }
}

export function selectPlatform(): PlatformPort {
  return '__TAURI_INTERNALS__' in window ? createTauriPlatform() : createBrowserPlatform()
}
