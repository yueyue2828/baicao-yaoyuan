import { parseDemoConfig, type DemoConfig } from './demo-config'

export type ConfigReader = () => Promise<unknown>
export type ConfigLoadResult =
  | { ok: true; config: DemoConfig }
  | { ok: false; message: string }

const browserReader: ConfigReader = async () => {
  const response = await fetch('/data/demo-config.json')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function loadDemoConfig(
  read: ConfigReader = browserReader,
): Promise<ConfigLoadResult> {
  try {
    return { ok: true, config: parseDemoConfig(await read()) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, message: `无法读取游戏配置：${message}` }
  }
}
