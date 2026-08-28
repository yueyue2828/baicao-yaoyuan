# 工程基础与应用空壳 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可测试、可缩放、可生成 Windows NSIS 安装程序的《百草药园》应用空壳，为后续药田、母株与战斗领域逻辑提供稳定边界。

**Architecture:** Vue 3 管理路由、响应式界面和 Pinia 会话状态；PixiJS 只负责画面表现；纯 TypeScript 模块提供时钟、随机源和配置校验；Tauri 2 提供 Windows 外壳。此阶段不实现真实玩法，只建立后续计划会依赖的接口和测试入口。

**Tech Stack:** Node 22、pnpm、Vue 3、TypeScript、Vite、Vue Router、Pinia、PixiJS 8.17、Zod、Vitest、Vue Test Utils、Playwright、Tauri 2、Rust stable-msvc、GitHub Actions

**Spec:** `docs/superpowers/specs/2026-08-28-windows-demo-vertical-slice-design.md`

## Global Constraints

- 首版只公开 Windows 10/11 安装程序；浏览器模式仅用于开发和自动测试。
- 应用必须完全离线运行，不请求账号、服务器或联网权限。
- Node 使用 22.x；依赖版本由 `app/pnpm-lock.yaml` 固定。
- Tauri 使用 2.x，Rust 使用 `stable-msvc` 工具链，安装目标使用 NSIS。
- PixiJS 使用 8.17.x；安全区固定为 1280×720。
- 最小窗口为 1024×640，UI 缩放范围为 80%～200%。
- 领域与配置模块不得引用 Vue、Pinia、PixiJS 或 Tauri。
- 所有运行时配置在进入应用前完成结构、ID 和引用校验。
- 界面文本不得把幻想战斗效果表述为现实医疗建议。
- 每个任务遵循测试先行，并以独立提交结束。

## File Structure

```text
app/
├─ package.json                    # 前端、测试和 Tauri 命令
├─ pnpm-lock.yaml                  # 固定 JavaScript 依赖
├─ vite.config.ts                  # Vue/Vite 与测试配置
├─ playwright.config.ts            # 浏览器端验收配置
├─ public/data/demo-config.json    # 最小可校验 Demo 配置
├─ src/
│  ├─ main.ts                      # Vue 启动入口
│  ├─ app/App.vue                  # 根组件与启动状态
│  ├─ app/router.ts                # 五个核心界面路由
│  ├─ app/stores/app-store.ts      # 启动、导航和平台信息
│  ├─ app/stores/display-store.ts  # UI 缩放和显示设置
│  ├─ application/bootstrap.ts     # 配置加载与应用启动编排
│  ├─ application/ports/platform.ts# 平台能力接口
│  ├─ config/demo-config.ts        # Zod 配置模型
│  ├─ config/load-config.ts        # 配置读取与错误归一化
│  ├─ domain/shared/clock.ts       # 可注入时钟
│  ├─ domain/shared/random.ts      # 可保存状态的确定性随机源
│  ├─ infra/platform/browser.ts    # 开发模式平台适配器
│  ├─ infra/platform/tauri.ts      # Tauri 平台适配器
│  ├─ rendering/pixi/game-stage.ts # Pixi 容器与图层生命周期
│  ├─ rendering/pixi/viewport.ts   # 1280×720 安全区缩放计算
│  ├─ ui/layout/AppShell.vue       # 响应式主框架
│  ├─ ui/components/PixiStage.vue  # Pixi 生命周期桥接
│  ├─ ui/screens/*.vue             # 药田、收藏、BD、战斗、设置占位页
│  └─ ui/styles/tokens.css         # 百草绘卷设计令牌
├─ e2e/app-shell.spec.ts           # 路由、缩放和无溢出验收
└─ src-tauri/
   ├─ Cargo.toml                   # Tauri/Rust 依赖
   ├─ tauri.conf.json              # 窗口与 NSIS 配置
   ├─ capabilities/default.json    # 最小权限能力
   └─ src/{lib.rs,main.rs}         # Tauri 入口与 app_info 命令
.github/workflows/verify.yml       # Windows 构建和测试
```

---

### Task 1: Scaffold the Vue and Tauri Application

**Files:**
- Create: `app/package.json`
- Create: `app/pnpm-lock.yaml`
- Create: `app/vite.config.ts`
- Create: `app/src/main.ts`
- Create: `app/src/app/App.vue`
- Create: `app/src/app/App.spec.ts`
- Create: `app/src-tauri/**`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: none
- Produces: `pnpm dev`, `pnpm test:unit`, `pnpm typecheck`, `pnpm build`, `pnpm tauri dev`, and `pnpm tauri build` commands from `app/package.json`

- [ ] **Step 1: Verify the Windows toolchain before scaffolding**

Run:

```powershell
node --version
corepack pnpm --version
rustc --version
cargo --version
rustup show active-toolchain
```

Expected: Node reports `v22.x`; Rust reports a stable `x86_64-pc-windows-msvc` toolchain. If MSVC Build Tools or WebView2 is missing, install the official Tauri Windows prerequisites before continuing.

- [ ] **Step 2: Scaffold the frontend with the official Vue tool**

Run from the repository root:

```powershell
corepack enable
pnpm create vue@latest app
```

Choose these exact answers:

```text
TypeScript: Yes
JSX: No
Vue Router: Yes
Pinia: Yes
Vitest: Yes
End-to-End Testing: Playwright
ESLint: Yes
Prettier: Yes
Vue DevTools: No
```

Then run:

```powershell
Set-Location app
pnpm install
pnpm add pixi.js@8.17 zod @tauri-apps/api@^2
pnpm add -D @tauri-apps/cli@^2
```

Expected: `pnpm-lock.yaml` exists and all installs exit with code 0.

- [ ] **Step 3: Initialize Tauri with exact desktop settings**

Run from `app/`:

```powershell
pnpm tauri init --ci --app-name "百草药园" --window-title "百草药园" --frontend-dist "../dist" --dev-url "http://localhost:5173" --before-dev-command "pnpm dev" --before-build-command "pnpm build"
```

Expected: `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`, and `src-tauri/src/main.rs` exist.

- [ ] **Step 4: Write the failing root-component test**

Replace the generated component test with `app/src/app/App.spec.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from './App.vue'

describe('App', () => {
  it('renders the game identity', () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: { template: '<main data-testid="route-view" />' } },
      },
    })

    expect(wrapper.get('[data-testid="game-title"]').text()).toBe('百草药园')
    expect(wrapper.get('[data-testid="route-view"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 5: Run the test and verify the generated app fails**

Run:

```powershell
pnpm vitest run src/app/App.spec.ts
```

Expected: FAIL because `src/app/App.vue` and the required `data-testid` elements do not yet exist.

- [ ] **Step 6: Implement the minimal root component and entry point**

Create `app/src/app/App.vue`:

```vue
<template>
  <div class="app-root">
    <h1 class="sr-only" data-testid="game-title">百草药园</h1>
    <RouterView />
  </div>
</template>
```

Create `app/src/main.ts`:

```ts
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app/App.vue'
import { router } from './app/router'
import './ui/styles/tokens.css'

createApp(App).use(createPinia()).use(router).mount('#app')
```

Create a temporary `app/src/app/router.ts` so the entry point typechecks:

```ts
import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [],
})
```

- [ ] **Step 7: Normalize package scripts and ignore build outputs**

Ensure `app/package.json` contains:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "run-p type-check build-only",
    "build-only": "vite build",
    "type-check": "vue-tsc --build",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "tauri": "tauri"
  }
}
```

Add these lines to `.gitignore` if the Vue scaffold did not already cover them:

```gitignore
app/node_modules/
app/dist/
app/test-results/
app/playwright-report/
app/src-tauri/target/
```

- [ ] **Step 8: Run the foundation checks**

Run:

```powershell
pnpm test:unit
pnpm type-check
pnpm build
cargo test --manifest-path src-tauri/Cargo.toml
```

Expected: all commands exit with code 0; Vite creates `app/dist/`.

- [ ] **Step 9: Commit the scaffold**

```powershell
git add .gitignore app
git commit -m "build: scaffold Vue and Tauri application"
```

---

### Task 2: Add Injectable Clock and Deterministic Random Source

**Files:**
- Create: `app/src/domain/shared/clock.ts`
- Create: `app/src/domain/shared/clock.spec.ts`
- Create: `app/src/domain/shared/random.ts`
- Create: `app/src/domain/shared/random.spec.ts`

**Interfaces:**
- Consumes: Vitest configured by Task 1
- Produces: `Clock`, `SystemClock`, `FixedClock`, `RandomSource`, and `XorShift32` for all later domain modules

- [ ] **Step 1: Write failing clock tests**

Create `app/src/domain/shared/clock.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { FixedClock, SystemClock } from './clock'

describe('Clock', () => {
  it('returns a fixed value in deterministic tests', () => {
    expect(new FixedClock(123456).nowMs()).toBe(123456)
  })

  it('uses the injected system function', () => {
    expect(new SystemClock(() => 42).nowMs()).toBe(42)
  })
})
```

- [ ] **Step 2: Write failing random-source tests**

Create `app/src/domain/shared/random.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { XorShift32 } from './random'

describe('XorShift32', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = new XorShift32(20260828)
    const b = new XorShift32(20260828)
    expect([a.nextFloat(), a.nextFloat(), a.nextFloat()]).toEqual([
      b.nextFloat(),
      b.nextFloat(),
      b.nextFloat(),
    ])
  })

  it('restores an exact saved state', () => {
    const rng = new XorShift32(7)
    rng.nextFloat()
    const saved = rng.getState()
    const expected = rng.nextFloat()
    rng.setState(saved)
    expect(rng.nextFloat()).toBe(expected)
  })

  it('always returns a value in [0, 1)', () => {
    const rng = new XorShift32(99)
    for (let i = 0; i < 1000; i += 1) {
      const value = rng.nextFloat()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
```

- [ ] **Step 3: Run the tests and verify both modules are missing**

Run:

```powershell
pnpm vitest run src/domain/shared/clock.spec.ts src/domain/shared/random.spec.ts
```

Expected: FAIL with module-resolution errors for `./clock` and `./random`.

- [ ] **Step 4: Implement the clock interfaces**

Create `app/src/domain/shared/clock.ts`:

```ts
export interface Clock {
  nowMs(): number
}

export class SystemClock implements Clock {
  constructor(private readonly readNow: () => number = Date.now) {}

  nowMs(): number {
    return this.readNow()
  }
}

export class FixedClock implements Clock {
  constructor(private currentMs: number) {}

  nowMs(): number {
    return this.currentMs
  }

  advanceMs(deltaMs: number): void {
    this.currentMs += deltaMs
  }
}
```

- [ ] **Step 5: Implement the deterministic random source**

Create `app/src/domain/shared/random.ts`:

```ts
export interface RandomSource {
  nextFloat(): number
  getState(): number
  setState(state: number): void
}

export class XorShift32 implements RandomSource {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0 || 0x6d2b79f5
  }

  nextFloat(): number {
    let value = this.state
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    this.state = value >>> 0
    return this.state / 0x1_0000_0000
  }

  getState(): number {
    return this.state
  }

  setState(state: number): void {
    this.state = state >>> 0 || 0x6d2b79f5
  }
}
```

- [ ] **Step 6: Run tests, typecheck, and commit**

Run:

```powershell
pnpm vitest run src/domain/shared/clock.spec.ts src/domain/shared/random.spec.ts
pnpm type-check
git add app/src/domain/shared
git commit -m "feat: add deterministic domain primitives"
```

Expected: all tests pass and the commit succeeds.

---

### Task 3: Validate Runtime Configuration Before Boot

**Files:**
- Create: `app/src/config/demo-config.ts`
- Create: `app/src/config/demo-config.spec.ts`
- Create: `app/src/config/load-config.ts`
- Create: `app/src/config/load-config.spec.ts`
- Create: `app/public/data/demo-config.json`
- Create: `app/src/application/bootstrap.ts`
- Modify: `app/src/app/App.vue`
- Test: `app/src/app/App.spec.ts`

**Interfaces:**
- Consumes: browser `fetch`, Zod
- Produces: `DemoConfig`, `parseDemoConfig(input: unknown): DemoConfig`, `loadDemoConfig(read?: ConfigReader): Promise<ConfigLoadResult>`, and `bootstrapApplication(): Promise<BootState>`

- [ ] **Step 1: Write failing schema tests**

Create `app/src/config/demo-config.spec.ts`:

```ts
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

  it('rejects duplicate IDs', () => {
    expect(() => parseDemoConfig({ ...validConfig, herbs: [validConfig.herbs[0], validConfig.herbs[0]] })).toThrow(
      '药材 ID 必须唯一',
    )
  })

  it('rejects unreviewed public culture content', () => {
    expect(() =>
      parseDemoConfig({
        ...validConfig,
        herbs: [{ ...validConfig.herbs[0], culture: { category: '传统记载', sourceStatus: 'draft' } }],
      }),
    ).toThrow()
  })
})
```

- [ ] **Step 2: Run the schema test and verify failure**

Run:

```powershell
pnpm vitest run src/config/demo-config.spec.ts
```

Expected: FAIL because `demo-config.ts` does not exist.

- [ ] **Step 3: Implement the minimal schema with uniqueness validation**

Create `app/src/config/demo-config.ts`:

```ts
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
```

- [ ] **Step 4: Write failing loader tests**

Create `app/src/config/load-config.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { loadDemoConfig } from './load-config'

describe('loadDemoConfig', () => {
  it('normalizes a read failure', async () => {
    const result = await loadDemoConfig(async () => {
      throw new Error('disk unavailable')
    })
    expect(result).toEqual({ ok: false, message: '无法读取游戏配置：disk unavailable' })
  })

  it('returns parsed data', async () => {
    const result = await loadDemoConfig(async () => ({
      schemaVersion: 1,
      herbs: [
        { id: 'gancao', name: '甘草', tier: 1, culture: { category: '传统记载', sourceStatus: 'reviewed' } },
      ],
    }))
    expect(result.ok).toBe(true)
  })
})
```

- [ ] **Step 5: Implement the loader and boot result**

Create `app/src/config/load-config.ts`:

```ts
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

export async function loadDemoConfig(read: ConfigReader = browserReader): Promise<ConfigLoadResult> {
  try {
    return { ok: true, config: parseDemoConfig(await read()) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, message: `无法读取游戏配置：${message}` }
  }
}
```

Create `app/src/application/bootstrap.ts`:

```ts
import { loadDemoConfig } from '@/config/load-config'

export type BootState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }

export async function bootstrapApplication(): Promise<BootState> {
  const result = await loadDemoConfig()
  return result.ok ? { status: 'ready' } : { status: 'error', message: result.message }
}
```

- [ ] **Step 6: Add the six reviewed herb records**

Create `app/public/data/demo-config.json`:

```json
{
  "schemaVersion": 1,
  "herbs": [
    { "id": "gancao", "name": "甘草", "tier": 1, "culture": { "category": "传统记载", "sourceStatus": "reviewed" } },
    { "id": "huangqi", "name": "黄芪", "tier": 1, "culture": { "category": "传统记载", "sourceStatus": "reviewed" } },
    { "id": "shengjiang", "name": "生姜", "tier": 1, "culture": { "category": "传统记载", "sourceStatus": "reviewed" } },
    { "id": "rougui", "name": "肉桂", "tier": 1, "culture": { "category": "传统记载", "sourceStatus": "reviewed" } },
    { "id": "danggui", "name": "当归", "tier": 1, "culture": { "category": "传统记载", "sourceStatus": "reviewed" } },
    { "id": "chuanxiong", "name": "川芎", "tier": 1, "culture": { "category": "传统记载", "sourceStatus": "reviewed" } }
  ]
}
```

- [ ] **Step 7: Render an explicit boot error instead of an empty app**

Update `App.vue` to await `bootstrapApplication()` in `onMounted`. Render:

```ts
import { onMounted, ref } from 'vue'
import { bootstrapApplication, type BootState } from '@/application/bootstrap'

const boot = ref<BootState>({ status: 'loading' })
onMounted(async () => {
  boot.value = await bootstrapApplication()
})
```

```vue
<main v-if="boot.status === 'error'" class="boot-error" role="alert">
  <h2>游戏资料加载失败</h2>
  <p>{{ boot.message }}</p>
  <p>存档尚未被修改。请重新安装或联系开发者。</p>
</main>
<RouterView v-else-if="boot.status === 'ready'" />
<main v-else aria-busy="true">正在整理药园……</main>
```

Extend `App.spec.ts` with a mocked failed bootstrap and assert that `role="alert"` and “存档尚未被修改” are visible.

Use this exact test setup:

```ts
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bootstrapApplication } from '@/application/bootstrap'
import App from './App.vue'

vi.mock('@/application/bootstrap', () => ({ bootstrapApplication: vi.fn() }))
const bootstrapMock = vi.mocked(bootstrapApplication)

describe('App boot failure', () => {
  beforeEach(() => bootstrapMock.mockReset())

  it('shows a non-destructive configuration error', async () => {
    bootstrapMock.mockResolvedValue({ status: 'error', message: '无法读取游戏配置：invalid' })
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('游戏资料加载失败')
    expect(wrapper.get('[role="alert"]').text()).toContain('存档尚未被修改')
  })
})
```

- [ ] **Step 8: Run focused and full tests, then commit**

Run:

```powershell
pnpm vitest run src/config src/app/App.spec.ts
pnpm test:unit
pnpm type-check
git add app/public/data app/src/config app/src/application app/src/app/App.vue app/src/app/App.spec.ts
git commit -m "feat: validate game configuration at startup"
```

Expected: all commands pass; invalid configuration produces a visible error and does not enter the app shell.

---

### Task 4: Build the Responsive Vue Application Shell

**Files:**
- Create: `app/src/ui/layout/AppShell.vue`
- Create: `app/src/ui/layout/AppShell.spec.ts`
- Create: `app/src/ui/screens/FarmScreen.vue`
- Create: `app/src/ui/screens/CollectionScreen.vue`
- Create: `app/src/ui/screens/BuildScreen.vue`
- Create: `app/src/ui/screens/BattleScreen.vue`
- Create: `app/src/ui/screens/SettingsScreen.vue`
- Create: `app/src/app/stores/app-store.ts`
- Modify: `app/src/app/router.ts`
- Modify: `app/src/app/App.vue`

**Interfaces:**
- Consumes: Vue Router and Pinia from Task 1, successful boot state from Task 3
- Produces: named routes `farm`, `collection`, `build`, `battle`, and `settings`; `useAppStore()` with `activeSection`

- [ ] **Step 1: Write the failing shell test**

Create `app/src/ui/layout/AppShell.spec.ts`:

```ts
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppShell from './AppShell.vue'

describe('AppShell', () => {
  it('shows all five primary destinations', () => {
    const wrapper = mount(AppShell, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RouterView: { template: '<main />' },
        },
      },
    })
    expect(wrapper.text()).toContain('药田')
    expect(wrapper.text()).toContain('本草')
    expect(wrapper.text()).toContain('队伍')
    expect(wrapper.text()).toContain('战斗')
    expect(wrapper.text()).toContain('设置')
  })
})
```

Add `@pinia/testing` if the scaffold did not install it:

```powershell
pnpm add -D @pinia/testing
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
pnpm vitest run src/ui/layout/AppShell.spec.ts
```

Expected: FAIL because `AppShell.vue` does not exist.

- [ ] **Step 3: Define routes and focused screen components**

Replace `router.ts` with lazy imports:

```ts
import { createRouter, createWebHashHistory } from 'vue-router'
import AppShell from '@/ui/layout/AppShell.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', name: 'farm', component: () => import('@/ui/screens/FarmScreen.vue') },
        { path: 'collection', name: 'collection', component: () => import('@/ui/screens/CollectionScreen.vue') },
        { path: 'build', name: 'build', component: () => import('@/ui/screens/BuildScreen.vue') },
        { path: 'battle', name: 'battle', component: () => import('@/ui/screens/BattleScreen.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/ui/screens/SettingsScreen.vue') },
      ],
    },
  ],
})
```

Each screen must contain one semantic `<h2>` and one sentence describing its future responsibility. Example `FarmScreen.vue`:

```vue
<template>
  <section aria-labelledby="farm-title">
    <h2 id="farm-title">药田</h2>
    <p>种植、成长、收获与离线结算将在此呈现。</p>
  </section>
</template>
```

- [ ] **Step 4: Implement the app store and shell**

Create `app-store.ts`:

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const activeSection = ref('farm')
  return { activeSection }
})
```

Create `AppShell.vue` with a `<nav aria-label="主要功能">`, five `RouterLink` elements, and a `<RouterView />`. Use these exact labels and routes:

```ts
const destinations = [
  { name: 'farm', label: '药田' },
  { name: 'collection', label: '本草' },
  { name: 'build', label: '队伍' },
  { name: 'battle', label: '战斗' },
  { name: 'settings', label: '设置' },
] as const
```

The component template is:

```vue
<template>
  <div class="app-shell">
    <header class="app-header">
      <strong>百草药园</strong>
    </header>
    <div class="app-body">
      <nav class="primary-nav" aria-label="主要功能">
        <RouterLink v-for="item in destinations" :key="item.name" :to="{ name: item.name }">
          {{ item.label }}
        </RouterLink>
      </nav>
      <main class="screen-content"><RouterView /></main>
    </div>
  </div>
</template>
```

Update `App.vue` so the ready state renders only `<RouterView />`; `AppShell` is owned by the router.

- [ ] **Step 5: Run tests and verify route chunks build**

Run:

```powershell
pnpm vitest run src/ui/layout/AppShell.spec.ts
pnpm type-check
pnpm build
```

Expected: test passes; the production build contains separate lazy route chunks.

- [ ] **Step 6: Commit the application shell**

```powershell
git add app/src/app app/src/ui app/package.json app/pnpm-lock.yaml
git commit -m "feat: add responsive application navigation"
```

---

### Task 5: Add Display Settings and Safe-Area Calculations

**Files:**
- Create: `app/src/app/stores/display-store.ts`
- Create: `app/src/app/stores/display-store.spec.ts`
- Create: `app/src/rendering/pixi/viewport.ts`
- Create: `app/src/rendering/pixi/viewport.spec.ts`
- Create: `app/src/ui/styles/tokens.css`
- Modify: `app/src/ui/layout/AppShell.vue`
- Modify: `app/src/ui/screens/SettingsScreen.vue`

**Interfaces:**
- Consumes: Pinia
- Produces: `DisplaySettings`, `useDisplayStore()`, and `computeSafeViewport(width, height): SafeViewport`

- [ ] **Step 1: Write failing display-store tests**

Create `display-store.spec.ts`:

```ts
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDisplayStore } from './display-store'

describe('display store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('clamps UI scale to 80–200 percent', () => {
    const store = useDisplayStore()
    store.setUiScale(30)
    expect(store.uiScalePercent).toBe(80)
    store.setUiScale(250)
    expect(store.uiScalePercent).toBe(200)
  })
})
```

- [ ] **Step 2: Write failing viewport tests**

Create `viewport.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { computeSafeViewport } from './viewport'

describe('computeSafeViewport', () => {
  it('fits 1280×720 exactly', () => {
    expect(computeSafeViewport(1280, 720)).toEqual({ scale: 1, offsetX: 0, offsetY: 0, visibleWidth: 1280, visibleHeight: 720 })
  })

  it('letterboxes a 4:3 container without clipping the safe area', () => {
    const result = computeSafeViewport(1024, 768)
    expect(result.scale).toBe(0.8)
    expect(result.offsetY).toBe(96)
  })

  it('extends the visible width on ultrawide screens', () => {
    expect(computeSafeViewport(3440, 1440).visibleWidth).toBe(1720)
  })
})
```

- [ ] **Step 3: Run the tests and verify failure**

Run:

```powershell
pnpm vitest run src/app/stores/display-store.spec.ts src/rendering/pixi/viewport.spec.ts
```

Expected: FAIL because both implementation modules are missing.

- [ ] **Step 4: Implement display settings**

Create `display-store.ts`:

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface DisplaySettings {
  uiScalePercent: number
  reduceEffects: boolean
  pixelSharpness: boolean
}

export const useDisplayStore = defineStore('display', () => {
  const uiScalePercent = ref(100)
  const reduceEffects = ref(false)
  const pixelSharpness = ref(true)
  const cssScale = computed(() => uiScalePercent.value / 100)

  function setUiScale(value: number): void {
    uiScalePercent.value = Math.min(200, Math.max(80, Math.round(value)))
  }

  return { uiScalePercent, reduceEffects, pixelSharpness, cssScale, setUiScale }
})
```

- [ ] **Step 5: Implement safe-area calculations**

Create `viewport.ts`:

```ts
export interface SafeViewport {
  scale: number
  offsetX: number
  offsetY: number
  visibleWidth: number
  visibleHeight: number
}

export function computeSafeViewport(width: number, height: number): SafeViewport {
  const scale = Math.min(width / 1280, height / 720)
  const visibleWidth = width / scale
  const visibleHeight = height / scale
  return {
    scale,
    offsetX: (width - 1280 * scale) / 2,
    offsetY: (height - 720 * scale) / 2,
    visibleWidth,
    visibleHeight,
  }
}
```

- [ ] **Step 6: Apply the 百草绘卷 design tokens and responsive rules**

Create `tokens.css` with these root tokens:

```css
:root {
  color-scheme: light;
  --paper: #f6f0df;
  --paper-deep: #e8dcc0;
  --ink: #263d36;
  --jade: #55766b;
  --cinnabar: #a94735;
  --gold: #c79a43;
  --focus: #1769aa;
  --ui-scale: 1;
  font-family: "Microsoft YaHei UI", "Noto Sans CJK SC", sans-serif;
}

* { box-sizing: border-box; }
html, body, #app { width: 100%; min-width: 1024px; min-height: 640px; margin: 0; }
body { color: var(--ink); background: var(--paper); }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
```

Bind `--ui-scale` on the shell root and expose a labeled range control plus “减少特效” checkbox on `SettingsScreen.vue`.

- [ ] **Step 7: Run tests at all target viewport calculations and commit**

Run:

```powershell
pnpm vitest run src/app/stores/display-store.spec.ts src/rendering/pixi/viewport.spec.ts
pnpm test:unit
pnpm type-check
git add app/src/app/stores/display-store* app/src/rendering/pixi/viewport* app/src/ui
git commit -m "feat: add scalable display foundation"
```

Expected: all tests pass; 4:3 and ultrawide calculations preserve the 1280×720 safe area.

---

### Task 6: Create the PixiJS Stage and Layer Lifecycle

**Files:**
- Create: `app/src/rendering/pixi/game-stage.ts`
- Create: `app/src/rendering/pixi/game-stage.spec.ts`
- Create: `app/src/ui/components/PixiStage.vue`
- Modify: `app/src/ui/screens/BattleScreen.vue`

**Interfaces:**
- Consumes: `computeSafeViewport()` from Task 5
- Produces: `createGameStage(host: HTMLElement): Promise<GameStage>` where `GameStage` exposes named layers, `resize()`, and `destroy()`

- [ ] **Step 1: Write the failing layer-order test**

Create `game-stage.spec.ts` with `Application` mocked so no real WebGL context is required:

```ts
import { describe, expect, it, vi } from 'vitest'

vi.mock('pixi.js', () => {
  class Container {
    label = ''
    children: Container[] = []
    addChild(...children: Container[]) { this.children.push(...children) }
    destroy() {}
  }
  class Application {
    canvas = document.createElement('canvas')
    stage = new Container()
    init = vi.fn()
    destroy = vi.fn()
  }
  return { Application, Container }
})

import { createGameStage } from './game-stage'

describe('createGameStage', () => {
  it('creates layers in stable rendering order', async () => {
    const host = document.createElement('div')
    const stage = await createGameStage(host)
    expect(Object.keys(stage.layers)).toEqual(['background', 'world', 'actors', 'effects', 'hud'])
    expect(host.querySelector('canvas')).not.toBeNull()
  })
})
```

Set the Vitest environment for this file to `jsdom` if the scaffold defaults to Node.

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
pnpm vitest run src/rendering/pixi/game-stage.spec.ts
```

Expected: FAIL because `game-stage.ts` does not exist.

- [ ] **Step 3: Implement the named-layer stage**

Create `game-stage.ts`:

```ts
import { Application, Container } from 'pixi.js'
import { computeSafeViewport } from './viewport'

export interface GameStage {
  layers: Record<'background' | 'world' | 'actors' | 'effects' | 'hud', Container>
  resize(width: number, height: number): void
  destroy(): void
}

export async function createGameStage(host: HTMLElement): Promise<GameStage> {
  const app = new Application()
  await app.init({ backgroundAlpha: 0, antialias: true, resizeTo: host })
  host.appendChild(app.canvas)

  const layers = {
    background: new Container({ label: 'background' }),
    world: new Container({ label: 'world' }),
    actors: new Container({ label: 'actors' }),
    effects: new Container({ label: 'effects' }),
    hud: new Container({ label: 'hud' }),
  }
  app.stage.addChild(...Object.values(layers))

  return {
    layers,
    resize(width, height) {
      const viewport = computeSafeViewport(width, height)
      app.stage.scale.set(viewport.scale)
      app.stage.position.set(viewport.offsetX, viewport.offsetY)
    },
    destroy() {
      app.destroy(true, { children: true, texture: true })
    },
  }
}
```

- [ ] **Step 4: Bridge Pixi lifecycle into Vue**

Create `PixiStage.vue` with a host `ref`, `ResizeObserver`, `onMounted`, and `onBeforeUnmount`. It must call `createGameStage(host)`, call `resize(entry.contentRect.width, entry.contentRect.height)` on each resize, and call `destroy()` exactly once on unmount. Give the host `role="img"` and `aria-label="自动战斗场景"`; detailed battle results remain available as text outside the canvas.

Use this implementation:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createGameStage, type GameStage } from '@/rendering/pixi/game-stage'

const host = ref<HTMLElement>()
let stage: GameStage | undefined
let observer: ResizeObserver | undefined

onMounted(async () => {
  if (!host.value) return
  stage = await createGameStage(host.value)
  observer = new ResizeObserver(([entry]) => {
    if (entry) stage?.resize(entry.contentRect.width, entry.contentRect.height)
  })
  observer.observe(host.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = undefined
  stage?.destroy()
  stage = undefined
})
</script>

<template>
  <div ref="host" class="pixi-stage" role="img" aria-label="自动战斗场景" />
</template>
```

Render `<PixiStage />` inside `BattleScreen.vue` above the future textual battle report region.

- [ ] **Step 5: Run focused tests, build, and commit**

Run:

```powershell
pnpm vitest run src/rendering/pixi
pnpm test:unit
pnpm type-check
pnpm build
git add app/src/rendering/pixi app/src/ui/components/PixiStage.vue app/src/ui/screens/BattleScreen.vue
git commit -m "feat: add layered Pixi rendering stage"
```

Expected: layer-order and viewport tests pass; the browser build completes without importing Tauri-only APIs.

---

### Task 7: Configure the Tauri Host and Windows Installer

**Files:**
- Create: `app/src/application/ports/platform.ts`
- Create: `app/src/infra/platform/browser.ts`
- Create: `app/src/infra/platform/tauri.ts`
- Create: `app/src/infra/platform/platform.spec.ts`
- Modify: `app/src-tauri/src/lib.rs`
- Modify: `app/src-tauri/tauri.conf.json`
- Modify: `app/src-tauri/capabilities/default.json`
- Modify: `app/src/app/stores/app-store.ts`
- Modify: `app/src/ui/screens/SettingsScreen.vue`

**Interfaces:**
- Consumes: Tauri 2 invoke API
- Produces: `PlatformPort.getAppInfo(): Promise<AppInfo>` and Rust command `app_info`

- [ ] **Step 1: Write the failing platform-adapter test**

Create `platform.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```powershell
pnpm vitest run src/infra/platform/platform.spec.ts
```

Expected: FAIL because the platform port and browser adapter do not exist.

- [ ] **Step 3: Implement the TypeScript platform port**

Create `platform.ts`:

```ts
export interface AppInfo {
  name: string
  version: string
  runtime: 'browser' | 'tauri'
}

export interface PlatformPort {
  getAppInfo(): Promise<AppInfo>
}
```

Create `browser.ts`:

```ts
import type { PlatformPort } from '@/application/ports/platform'

export function createBrowserPlatform(): PlatformPort {
  return {
    async getAppInfo() {
      return { name: '百草药园', version: 'development', runtime: 'browser' }
    },
  }
}
```

Create `tauri.ts`:

```ts
import { invoke } from '@tauri-apps/api/core'
import type { AppInfo, PlatformPort } from '@/application/ports/platform'

export function createTauriPlatform(): PlatformPort {
  return { getAppInfo: () => invoke<AppInfo>('app_info') }
}
```

- [ ] **Step 4: Implement and test the Rust app-info command**

In `src-tauri/src/lib.rs`, define a serializable `AppInfo` and command:

```rust
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct AppInfo {
    name: &'static str,
    version: &'static str,
    runtime: &'static str,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "百草药园",
        version: env!("CARGO_PKG_VERSION"),
        runtime: "tauri",
    }
}
```

Register it with `tauri::generate_handler![app_info]`. Add a Rust unit test asserting the returned name and runtime.

- [ ] **Step 5: Lock window and installer settings**

Set these values in `tauri.conf.json`:

```json
{
  "productName": "百草药园",
  "version": "0.1.0",
  "identifier": "com.yueyue2828.baicaoyaoyuan",
  "app": {
    "windows": [
      {
        "title": "百草药园",
        "width": 1280,
        "height": 720,
        "minWidth": 1024,
        "minHeight": 640,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ipc: http://ipc.localhost",
      "devCsp": "default-src 'self' http://localhost:5173; img-src 'self' asset: data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ipc: http://ipc.localhost http://localhost:5173 ws://localhost:5173"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis"]
  }
}
```

Keep `capabilities/default.json` limited to `core:default`; do not enable HTTP, shell, updater, global shortcut, or unrestricted file-system permissions.

- [ ] **Step 6: Surface platform information in Settings**

Load `AppInfo` into `useAppStore()` during bootstrap. `SettingsScreen.vue` must show app name, version, runtime, and the statement “本版本完全离线运行”。Browser mode must visibly say “开发预览”，not “公开 Web 版”.

Add this selector to `app/src/infra/platform/browser.ts`:

```ts
import { createTauriPlatform } from './tauri'

export function selectPlatform(): PlatformPort {
  return '__TAURI_INTERNALS__' in window ? createTauriPlatform() : createBrowserPlatform()
}
```

Extend `useAppStore()` with:

```ts
import { ref } from 'vue'
import type { AppInfo, PlatformPort } from '@/application/ports/platform'
import { selectPlatform } from '@/infra/platform/browser'

const appInfo = ref<AppInfo>()

async function loadAppInfo(platform: PlatformPort = selectPlatform()): Promise<void> {
  appInfo.value = await platform.getAppInfo()
}
```

Call `loadAppInfo()` after configuration reaches the ready state. Render `appInfo.runtime === 'browser' ? '开发预览' : 'Windows 桌面版'` in Settings.

- [ ] **Step 7: Run frontend, Rust, and installer builds**

Run:

```powershell
pnpm vitest run src/infra/platform
pnpm test:unit
pnpm type-check
cargo test --manifest-path src-tauri/Cargo.toml
pnpm tauri build --bundles nsis
```

Expected: all tests pass; an installer matching `app/src-tauri/target/release/bundle/nsis/*-setup.exe` is created.

- [ ] **Step 8: Install and smoke-test the unsigned local build**

Run the generated installer as the current user, launch the installed app, verify the five navigation destinations, then uninstall it from Windows Settings. Record the exact installer filename in the commit body; do not commit the binary.

- [ ] **Step 9: Commit the desktop host**

```powershell
git add app/src/application/ports app/src/infra/platform app/src-tauri app/src/app/stores/app-store.ts app/src/ui/screens/SettingsScreen.vue
git commit -m "feat: add secure Windows desktop host"
```

---

### Task 8: Add End-to-End Verification and Windows CI

**Files:**
- Create: `app/e2e/app-shell.spec.ts`
- Modify: `app/playwright.config.ts`
- Create: `.github/workflows/verify.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: named routes from Task 4, display shell from Task 5, Pixi stage from Task 6, Tauri build from Task 7
- Produces: required CI checks `unit-and-web` and `windows-installer`

- [ ] **Step 1: Write failing browser acceptance tests**

Create `app/e2e/app-shell.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const viewports = [
  { width: 1024, height: 640 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 3440, height: 1440 },
  { width: 3840, height: 2160 },
]

for (const viewport of viewports) {
  test(`navigation fits ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    for (const label of ['药田', '本草', '队伍', '战斗', '设置']) {
      await expect(page.getByRole('link', { name: label })).toBeVisible()
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
  })
}

test('primary navigation works with the keyboard', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: '药田' })).toBeFocused()
})
```

- [ ] **Step 2: Configure Playwright and verify the test catches current gaps**

Set `playwright.config.ts` to use Chromium and:

```ts
webServer: {
  command: 'pnpm dev --host 127.0.0.1',
  url: 'http://127.0.0.1:5173',
  reuseExistingServer: !process.env.CI,
}
```

Run:

```powershell
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected before fixes: at least the 1024×640 or keyboard test fails if shell overflow/focus order is wrong. Make the smallest CSS or DOM-order correction in `AppShell.vue`, then rerun until all tests pass.

- [ ] **Step 3: Add Windows CI with two explicit jobs**

Create `.github/workflows/verify.yml`:

```yaml
name: verify

on:
  push:
    branches: [main]
  pull_request:

jobs:
  unit-and-web:
    runs-on: windows-latest
    defaults:
      run:
        working-directory: app
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: app/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install chromium
      - run: pnpm test:unit
      - run: pnpm type-check
      - run: pnpm build
      - run: pnpm test:e2e

  windows-installer:
    runs-on: windows-latest
    defaults:
      run:
        working-directory: app
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: app/pnpm-lock.yaml
      - uses: dtolnay/rust-toolchain@stable
      - run: pnpm install --frozen-lockfile
      - run: cargo test --manifest-path src-tauri/Cargo.toml
      - run: pnpm tauri build --bundles nsis
      - uses: actions/upload-artifact@v4
        with:
          name: baicao-yaoyuan-windows-installer
          path: app/src-tauri/target/release/bundle/nsis/*-setup.exe
          if-no-files-found: error
```

- [ ] **Step 4: Document exact developer commands**

Add to `README.md`:

````markdown
## 开发

前置条件：Node 22、pnpm、Rust stable-msvc、Microsoft C++ Build Tools 和 WebView2。

```powershell
Set-Location app
pnpm install
pnpm dev
pnpm test:unit
pnpm test:e2e
pnpm tauri dev
pnpm tauri build --bundles nsis
```

公开交付物只有 Windows 安装程序；浏览器启动方式仅用于开发和自动测试。
````

- [ ] **Step 5: Run the full local verification**

Run:

```powershell
Set-Location app
pnpm test:unit
pnpm type-check
pnpm build
pnpm test:e2e
cargo test --manifest-path src-tauri/Cargo.toml
pnpm tauri build --bundles nsis
```

Expected: every command exits with code 0 and the NSIS installer exists.

- [ ] **Step 6: Commit and push the completed foundation plan**

```powershell
Set-Location ..
git add .github/workflows/verify.yml README.md app
git commit -m "ci: verify web shell and Windows installer"
git push origin main
```

Expected: GitHub Actions reports both `unit-and-web` and `windows-installer` as successful, and the latter exposes the unsigned installer artifact.

## Completion Gate

The foundation phase is complete only when:

1. `pnpm test:unit`, `pnpm type-check`, `pnpm build`, and `pnpm test:e2e` pass;
2. `cargo test --manifest-path src-tauri/Cargo.toml` passes;
3. a Windows NSIS installer is generated and can install, launch, navigate, and uninstall under the current user;
4. all seven target viewport tests pass without horizontal overflow;
5. the application performs no runtime network request;
6. GitHub Actions passes on `main`;
7. the next plan can consume `Clock`, `RandomSource`, validated `DemoConfig`, named routes, `PlatformPort`, display settings, and the Pixi layer lifecycle without modifying their public signatures.

## Official References

- Vue quick start and Node requirement: https://vuejs.org/guide/quick-start.html
- Tauri Windows prerequisites: https://v2.tauri.app/start/prerequisites/
- Tauri Windows installer: https://v2.tauri.app/distribute/windows-installer/
- PixiJS 8.17 release: https://pixijs.com/blog/8.17.0
- Vitest guide: https://vitest.dev/guide/
- Playwright installation and CI basics: https://playwright.dev/docs/intro
