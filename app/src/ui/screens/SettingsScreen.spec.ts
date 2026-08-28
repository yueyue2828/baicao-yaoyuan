import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '@/app/stores/app-store'
import SettingsScreen from './SettingsScreen.vue'

describe('SettingsScreen', () => {
  const pinia = createPinia()

  beforeEach(() => setActivePinia(pinia))

  it('labels browser runtime as a development preview and confirms offline operation', () => {
    const app = useAppStore()
    app.appInfo = { name: '百草药园', version: 'development', runtime: 'browser' }

    const wrapper = mount(SettingsScreen, { global: { plugins: [pinia] } })

    expect(wrapper.text()).toContain('开发预览')
    expect(wrapper.text()).toContain('本版本完全离线运行')
    expect(wrapper.text()).not.toContain('公开 Web 版')
  })
})
