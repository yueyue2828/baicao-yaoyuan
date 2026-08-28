import { expect, test } from '@playwright/test'

const navigation = [
  ['药田', '药田'],
  ['本草', '本草'],
  ['队伍', '队伍'],
  ['战斗', '战斗'],
  ['设置', '设置'],
] as const

const desktopViewports = [
  { name: 'minimum', width: 1024, height: 640 },
  { name: 'hd', width: 1280, height: 720 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'full-hd', width: 1920, height: 1080 },
  { name: 'qhd', width: 2560, height: 1440 },
  { name: 'ultrawide', width: 3440, height: 1440 },
  { name: '4k', width: 3840, height: 2160 },
] as const

for (const viewport of desktopViewports) {
  test(`${viewport.name} ${viewport.width}×${viewport.height} 保持安全布局`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: '药田' })).toBeVisible()
    for (const [label] of navigation) {
      await expect(page.getByRole('link', { name: label })).toBeVisible()
    }

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth)

    const navigationBox = await page.getByRole('navigation', { name: '主要功能' }).boundingBox()
    expect(navigationBox).not.toBeNull()
    expect(Math.round(navigationBox!.y + navigationBox!.height)).toBe(viewport.height)
  })
}

test('五个主界面均可访问并保留可读标题', async ({ page }) => {
  await page.goto('/')

  for (const [label, heading] of navigation) {
    await page.getByRole('link', { name: label }).click()
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }

  await expect(page.getByRole('img', { name: '自动战斗场景' })).toHaveCount(0)
  await expect(page.getByText('本版本完全离线运行。')).toBeVisible()
})

test('主导航保持连续键盘焦点顺序', async ({ page }) => {
  await page.goto('/')
  const farmLink = page.getByRole('link', { name: '药田' })
  await farmLink.focus()
  await expect(farmLink).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: '本草' })).toBeFocused()
})

test('运行时只读取本地资源', async ({ page }) => {
  const externalRequests: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
      externalRequests.push(request.url())
    }
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: '药田' })).toBeVisible()
  expect(externalRequests).toEqual([])
})
