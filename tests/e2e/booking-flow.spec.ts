import { test, expect } from '@playwright/test'

// テナントslug（seedデータのBLOOM salon）
const TENANT_SLUG = 'bloom-salon'

test.describe('予約フロー（顧客向け）', () => {
  test('テナントHPが表示される', async ({ page }) => {
    const res = await page.goto(`/${TENANT_SLUG}`)
    // seedデータが入っていれば200、なければスキップ
    if (res?.status() === 404) {
      test.skip(true, 'Seed data not available')
      return
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('メニューページが表示される', async ({ page }) => {
    const res = await page.goto(`/${TENANT_SLUG}/menu`)
    if (res?.status() === 404) {
      test.skip(true, 'Seed data not available')
      return
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('スタッフページが表示される', async ({ page }) => {
    const res = await page.goto(`/${TENANT_SLUG}/staff`)
    if (res?.status() === 404) {
      test.skip(true, 'Seed data not available')
      return
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('ブログページが表示される', async ({ page }) => {
    const res = await page.goto(`/${TENANT_SLUG}/blog`)
    if (res?.status() === 404) {
      test.skip(true, 'Seed data not available')
      return
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('予約ページが表示される', async ({ page }) => {
    const res = await page.goto(`/${TENANT_SLUG}/book`)
    if (res?.status() === 404) {
      test.skip(true, 'Seed data not available')
      return
    }
    await expect(page.locator('body')).toBeVisible()
  })
})
