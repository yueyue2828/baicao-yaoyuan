import { describe, expect, it } from 'vitest'
import { loadDemoConfig } from './load-config'

describe('loadDemoConfig', () => {
  it('normalizes a read failure', async () => {
    const result = await loadDemoConfig(async () => {
      throw new Error('disk unavailable')
    })

    expect(result).toEqual({ ok: false, message: '无法读取游戏配置：disk unavailable' })
  })

  it('does not accept malformed game data', async () => {
    const result = await loadDemoConfig(async () => ({ schemaVersion: 1, herbs: [] }))

    expect(result.ok).toBe(false)
  })

  it('returns parsed data', async () => {
    const result = await loadDemoConfig(async () => ({
      schemaVersion: 1,
      herbs: [
        {
          id: 'gancao',
          name: '甘草',
          tier: 1,
          culture: { category: '传统记载', sourceStatus: 'reviewed' },
        },
      ],
    }))

    expect(result.ok).toBe(true)
  })
})
