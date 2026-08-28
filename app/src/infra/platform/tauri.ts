import { invoke } from '@tauri-apps/api/core'
import type { AppInfo, PlatformPort } from '@/application/ports/platform'

export function createTauriPlatform(): PlatformPort {
  return {
    getAppInfo: () => invoke<AppInfo>('app_info'),
  }
}
