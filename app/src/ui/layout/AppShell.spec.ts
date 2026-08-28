import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AppShell from './AppShell.vue'

describe('AppShell', () => {
  it('shows all five primary destinations in one labeled navigation', () => {
    const wrapper = mount(AppShell, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RouterView: { template: '<main />' },
        },
      },
    })

    const navigation = wrapper.get('nav[aria-label="主要功能"]')
    expect(navigation.findAll('a').map((link) => link.text())).toEqual([
      '药田',
      '本草',
      '队伍',
      '战斗',
      '设置',
    ])
  })
})
