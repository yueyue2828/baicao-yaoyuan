import { describe, expect, it } from 'vitest'
import { parseDemoConfig } from './demo-config'

const validConfig = {
  schemaVersion: 1,
  herbs: [
    {
      id: 'gancao',
      name: '甘草',
      tier: 1,
      culture: { category: '传统记载', sourceStatus: 'reviewed' },
    },
  ],
}

describe('parseDemoConfig', () => {
  it('accepts a reviewed herb entry', () => {
    expect(parseDemoConfig(validConfig).herbs[0]?.id).toBe('gancao')
  })

  it('rejects an empty herb catalog', () => {
    expect(() => parseDemoConfig({ ...validConfig, herbs: [] })).toThrow()
  })

  it('rejects duplicate IDs', () => {
    expect(() =>
      parseDemoConfig({ ...validConfig, herbs: [validConfig.herbs[0], validConfig.herbs[0]] }),
    ).toThrow('药材 ID 必须唯一')
  })

  it('rejects unreviewed public culture content', () => {
    expect(() =>
      parseDemoConfig({
        ...validConfig,
        herbs: [
          {
            ...validConfig.herbs[0],
            culture: { category: '传统记载', sourceStatus: 'draft' },
          },
        ],
      }),
    ).toThrow()
  })
})
