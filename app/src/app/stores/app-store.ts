import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppInfo, PlatformPort } from '@/application/ports/platform'
import { selectPlatform } from '@/infra/platform/browser'

export const useAppStore = defineStore('app', () => {
  const activeSection = ref('farm')
  const appInfo = ref<AppInfo>()

  async function loadAppInfo(platform: PlatformPort = selectPlatform()): Promise<void> {
    appInfo.value = await platform.getAppInfo()
  }

  return { activeSection, appInfo, loadAppInfo }
})
