import { loadDemoConfig } from '@/config/load-config'

export type BootState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }

export async function bootstrapApplication(): Promise<BootState> {
  const result = await loadDemoConfig()
  return result.ok ? { status: 'ready' } : { status: 'error', message: result.message }
}
