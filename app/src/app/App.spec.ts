import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from './App.vue'

describe('App', () => {
  it('renders the game identity and routed content', () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: { template: '<main data-testid="route-view" />' } },
      },
    })

    expect(wrapper.get('[data-testid="game-title"]').text()).toBe('百草药园')
    expect(wrapper.find('[data-testid="route-view"]').exists()).toBe(true)
  })
})
