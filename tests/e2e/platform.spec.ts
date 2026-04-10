import { test, expect } from '@playwright/test'

test.describe('ミナオスなびプラットフォーム', () => {
  test('トップページが表示される', async ({ page }) => {
    await page.goto('/') // platform layout uses (platform) route group
    await expect(page).toHaveTitle(/.+/)
  })

  test('検索ページが表示される', async ({ page }) => {
    await page.goto('/search')
    await expect(page).toHaveTitle(/.+/)
    // 検索フォームが存在
    await expect(page.locator('input[name="area"]')).toBeVisible()
    await expect(page.locator('input[name="symptom"]')).toBeVisible()
  })

  test('症状で検索できる', async ({ page }) => {
    await page.goto('/search?symptom=腰痛')
    await expect(page.locator('h1')).toContainText('腰痛')
  })

  test('エリアで検索できる', async ({ page }) => {
    await page.goto('/search?area=東京')
    await expect(page.locator('h1')).toContainText('東京')
  })

  test('存在しない院で404', async ({ page }) => {
    const res = await page.goto('/clinics/nonexistent-clinic-xyz')
    expect(res?.status()).toBe(404)
  })

  test('マイページは未ログインで案内表示', async ({ page }) => {
    await page.goto('/mypage')
    await expect(page.locator('text=ログインが必要です')).toBeVisible()
  })
})

test.describe('ミナオスなびAPI', () => {
  test('検索APIが200を返す', async ({ request }) => {
    const res = await request.get('/api/platform/search')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('data')
    expect(json).toHaveProperty('total')
  })

  test('検索APIが症状フィルターを受け付ける', async ({ request }) => {
    const res = await request.get('/api/platform/search?symptom=腰痛')
    expect(res.status()).toBe(200)
  })

  test('口コミ投稿にバリデーションがある', async ({ request }) => {
    const res = await request.post('/api/platform/clinics/test/reviews', {
      data: { authorName: '', content: '', rating: 0 },
    })
    // 400 or 404 (院が存在しない場合)
    expect([400, 404]).toContain(res.status())
  })
})

test.describe('課金ページ', () => {
  test('課金ステータスAPIが応答する', async ({ request }) => {
    const res = await request.get('/api/billing/status')
    // 200 or 401 (未認証)
    expect([200, 401, 403]).toContain(res.status())
  })

  test('課金ページが表示される', async ({ page }) => {
    await page.goto('/dashboard/billing')
    // ログインリダイレクトまたはページ表示
    await expect(page).toHaveURL(/\/(dashboard\/billing|login)/)
  })
})

test.describe('フォローアップAPI', () => {
  test('ルール一覧APIが応答する', async ({ request }) => {
    const res = await request.get('/api/follow-up/rules')
    expect([200, 401, 403]).toContain(res.status())
  })

  test('ログ一覧APIが応答する', async ({ request }) => {
    const res = await request.get('/api/follow-up/logs')
    expect([200, 401, 403]).toContain(res.status())
  })
})

test.describe('LINE設定API', () => {
  test('LINE設定APIが応答する', async ({ request }) => {
    const res = await request.get('/api/settings/line')
    expect([200, 401, 403]).toContain(res.status())
  })
})

test.describe('口コミ管理API', () => {
  test('レビュー一覧APIが応答する', async ({ request }) => {
    const res = await request.get('/api/reviews')
    expect([200, 401, 403]).toContain(res.status())
  })
})
