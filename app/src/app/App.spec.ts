import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '@/app/stores/app-store'
import { bootstrapApplication } from '@/application/bootstrap'
import App from './App.vue'

vi.mock('@/application/bootstrap', () => ({ bootstrapApplication: vi.fn() }))

const bootstrapMock = vi.mocked(bootstrapApplication)

describe('App startup', () => {
  let pinia: Pinia

  beforeEach(() => {
    bootstrapMock.mockReset()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('keeps routed content hidden while game data is loading', () => {
    bootstrapMock.mockResolvedValue({ status: 'ready' })

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: { RouterView: { template: '<main data-testid="route-view" />' } },
      },
    })

    expect(wrapper.get('[aria-busy="true"]').text()).toContain('正在整理药园')
    expect(wrapper.find('[data-testid="route-view"]').exists()).toBe(false)
  })

  it('renders the game identity and routed content after a valid boot', async () => {
    bootstrapMock.mockResolvedValue({ status: 'ready' })

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: { RouterView: { template: '<main data-testid="route-view" />' } },
      },
    })
    await flushPromises()

    expect(wrapper.get('[data-testid="game-title"]').text()).toBe('百草药园')
    expect(wrapper.find('[data-testid="route-view"]').exists()).toBe(true)
    expect(useAppStore().appInfo?.runtime).toBe('browser')
  })

  it('shows a non-destructive configuration error', async () => {
    bootstrapMock.mockResolvedValue({
      status: 'error',
      message: '无法读取游戏配置：invalid',
    })

    const wrapper = mount(App, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('游戏资料加载失败')
    expect(wrapper.get('[role="alert"]').text()).toContain('存档尚未被修改')
  })
})
