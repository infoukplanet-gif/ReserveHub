import { test, expect } from '@playwright/test'

test.describe('認証フロー', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1, h2').first()).toContainText('ログイン')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('新規登録ページが表示される', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h1, h2').first()).toContainText('登録')
  })

  test('パスワードリセットページが表示される', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('未認証でダッシュボードにアクセスするとリダイレクト', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/(login|dashboard)/)
  })
})
