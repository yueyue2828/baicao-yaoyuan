# 百草药园

一款以中药文化为主题的可爱 2D 放置刷宝 RPG。玩家经营药田，反复培育带有随机品质、词条和数值区间的永久“母株”，再用母株、方剂与弟子组成不同 BD，攻略各有机制的全自动任务和副本。

> 当前仓库处于基础原型阶段，还不是内容完整的游戏。现阶段交付重点是可扩展的应用底座、响应式界面、离线桌面宿主与 Windows 安装包流水线。

![“百草绘卷”主美术方向](docs/assets/gdd/art-direction-herbal-scroll-primary.png)

## 核心体验

```text
种植与挂机 → 收获随机母株 → 鉴定品质与词条 → 炮制/合方
       ↑                                      ↓
升级药田 ← 坐诊与副本奖励 ← 配置弟子、方剂和流派 BD
```

- 像刷顶级装备一样追求高品质母株、稀有词条和高数值词条；
- 通过续航护盾、温热爆发、气血急速等流派应对不同任务机制；
- 以图鉴、炮制、配伍和节气为文化载体，不把现实医学内容做成诊疗建议；
- 完全离线运行，无账号、广告或运行时外部网络依赖。

## 当前已实现

- Vue 3 单页应用及药田、本草、队伍、战斗、设置五个懒加载界面；
- Pinia 会话状态、可注入时钟与随机源，以及 Zod 配置启动校验；
- PixiJS 分层渲染底座和可读的战斗文本回退；
- 80%–200% UI 缩放与 1024×640 至 4K/超宽屏安全布局；
- Tauri 2 最小权限 Windows 宿主、NSIS 安装包和本地存档边界；
- Vitest、Playwright、Rust 测试及 GitHub Actions 构建流程。

尚未实现真实种植、掉落词条、BD 数值、战斗结算和存档内容；这些将在后续里程碑逐步接入现有接口。

## 技术栈

- 前端：Vue 3、TypeScript、Vite、Vue Router、Pinia；
- 画面：PixiJS 8；
- 桌面端：Tauri 2、Rust stable-msvc、NSIS；
- 校验与测试：Zod、Vitest、Vue Test Utils、Playwright；
- 目标平台：Windows 10/11；浏览器版本仅用于开发预览。

## 开发

### 环境要求

- Node.js 22；
- pnpm 10.34.5（仓库已固定 `packageManager`）；
- Rust stable，目标为 `stable-x86_64-pc-windows-msvc`；
- Visual Studio 2022 Build Tools（Desktop development with C++）；
- Microsoft Edge WebView2 Runtime。

### 安装与运行

```powershell
Set-Location app
pnpm install --frozen-lockfile
pnpm dev
```

浏览器开发预览默认地址为 `http://127.0.0.1:5173/`。启动原生桌面开发窗口：

```powershell
pnpm tauri dev
```

### 验证

```powershell
pnpm test:unit
pnpm type-check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --manifest-path src-tauri/Cargo.toml
```

端到端测试覆盖 1024×640、1280×720、1366×768、1920×1080、2560×1440、3440×1440 和 3840×2160，并检查主导航、键盘可达性、横向溢出与运行时网络边界。

### 构建 Windows 安装包

```powershell
pnpm tauri build --bundles nsis
```

生成文件位于 `app/src-tauri/target/release/bundle/nsis/`。当前安装包未进行代码签名，Windows 可能显示未知发布者提示。

## 目录结构

```text
app/                         Vue、PixiJS 与 Tauri 应用
  e2e/                       Playwright 验收测试
  public/config/             经过运行时校验的游戏配置
  src/app/                   启动、路由、状态与平台接口
  src/domain/                与界面无关的领域基础模块
  src/ui/                    页面、布局与 PixiJS 组件
  src-tauri/                 Rust 桌面宿主与安装包配置
docs/assets/gdd/             美术方向图
docs/superpowers/specs/      GDD 与纵向切片规格
docs/superpowers/plans/      开发路线和实施计划
.github/workflows/           自动验证与安装包构建
```

## 设计文档

- [完整 GDD](docs/superpowers/specs/2026-08-28-chinese-herbal-idle-rpg-gdd.md)
- [Windows Demo 纵向切片设计](docs/superpowers/specs/2026-08-28-windows-demo-vertical-slice-design.md)
- [Windows Demo 路线图](docs/superpowers/plans/2026-08-28-windows-demo-roadmap.md)
- [应用底座实施计划](docs/superpowers/plans/2026-08-28-foundation-app-shell-implementation.md)

## 中药文化与安全边界

游戏资料会明确区分三类内容：“传统文献记载”“现代安全/规范信息”和“游戏幻想设定”。本项目旨在传播中药文化与支持娱乐体验，不提供医学诊断、处方或用药建议；现实健康问题请咨询合格医疗专业人员。涉及保护动物、禁限用药材或存在安全风险的历史方剂，只作合规的文化说明或使用虚构替代物。

## 许可证

仓库目前尚未指定开源许可证。公开可见不代表授予复制、修改或再分发代码及美术资产的许可；正式开放协作前会补充明确的许可证与贡献说明。
