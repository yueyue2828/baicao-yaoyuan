import { describe, expect, it } from 'vitest'
import { createBrowserPlatform } from './browser'

describe('browser platform', () => {
  it('identifies the browser as development-only', async () => {
    await expect(createBrowserPlatform().getAppInfo()).resolves.toEqual({
      name: '百草药园',
      version: 'development',
      runtime: 'browser',
    })
  })
})
