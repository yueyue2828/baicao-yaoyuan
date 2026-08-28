export interface AppInfo {
  name: string
  version: string
  runtime: 'browser' | 'tauri'
}

export interface PlatformPort {
  getAppInfo(): Promise<AppInfo>
}
