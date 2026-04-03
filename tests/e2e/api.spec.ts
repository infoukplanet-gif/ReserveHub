import { test, expect } from '@playwright/test'

test.describe('API エンドポイント', () => {
  test('GET /api/menus がレスポンスを返す', async ({ request }) => {
    const res = await request.get('/api/menus')
    // 認証なしでも200かunauthが返る
    expect([200, 401, 403]).toContain(res.status())
  })

  test('GET /api/staff がレスポンスを返す', async ({ request }) => {
    const res = await request.get('/api/staff')
    expect([200, 401, 403]).toContain(res.status())
  })

  test('GET /api/customers がレスポンスを返す', async ({ request }) => {
    const res = await request.get('/api/customers')
    expect([200, 401, 403]).toContain(res.status())
  })

  test('GET /api/reservations がレスポンスを返す', async ({ request }) => {
    const res = await request.get('/api/reservations')
    expect([200, 401, 403]).toContain(res.status())
  })

  test('GET /api/settings がレスポンスを返す', async ({ request }) => {
    const res = await request.get('/api/settings')
    expect([200, 401, 403]).toContain(res.status())
  })

  test('GET /api/dashboard がレスポンスを返す', async ({ request }) => {
    const res = await request.get('/api/dashboard')
    expect([200, 401, 403]).toContain(res.status())
  })

  test('POST /api/reservations にバリデーションエラー', async ({ request }) => {
    const res = await request.post('/api/reservations', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    // 400 or 401
    expect([400, 401, 403]).toContain(res.status())
  })
})
