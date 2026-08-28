import { z } from 'zod'

const CultureSchema = z.object({
  category: z.enum(['传统记载', '现代规范与安全', '游戏设定']),
  sourceStatus: z.literal('reviewed'),
})

const HerbSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  tier: z.number().int().min(1).max(5),
  culture: CultureSchema,
})

const DemoConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    herbs: z.array(HerbSchema).min(1),
  })
  .superRefine((value, context) => {
    const ids = new Set<string>()

    for (const herb of value.herbs) {
      if (ids.has(herb.id)) {
        context.addIssue({ code: 'custom', message: '药材 ID 必须唯一', path: ['herbs'] })
      }
      ids.add(herb.id)
    }
  })

export type DemoConfig = z.infer<typeof DemoConfigSchema>

export function parseDemoConfig(input: unknown): DemoConfig {
  return DemoConfigSchema.parse(input)
}
