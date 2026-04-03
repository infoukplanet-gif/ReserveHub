import { test, expect } from '@playwright/test'

test.describe('公開ページ', () => {
  test('トップページが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
  })

  test('robots.txtが返される', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    const text = await res.text()
    expect(text).toContain('User-agent')
    expect(text).toContain('Disallow: /dashboard/')
  })

  test('sitemap.xmlが返される', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const text = await res.text()
    expect(text).toContain('<urlset')
  })

  test('テナントHP: 存在しないslugで404', async ({ page }) => {
    const res = await page.goto('/nonexistent-slug-12345')
    expect(res?.status()).toBe(404)
  })
})
