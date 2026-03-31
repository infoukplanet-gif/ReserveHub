# エラーハンドリング統一パターン

## API Route のエラーレスポンス

全APIで統一するフォーマット:

```typescript
type ApiError = {
  error: string       // ユーザー向けメッセージ（日本語）
  code: string        // 機械可読コード
  details?: unknown   // デバッグ用追加情報（dev環境のみ）
}
```

## HTTPステータスコードの使い分け

| コード | 使用場面 | code例 |
|---|---|---|
| 400 | バリデーションエラー | `VALIDATION_ERROR` |
| 401 | 未認証 | `UNAUTHORIZED` |
| 403 | 権限なし（他テナント等） | `FORBIDDEN` |
| 404 | リソースなし | `NOT_FOUND` |
| 409 | 競合（ダブルブッキング等） | `CONFLICT` |
| 422 | ビジネスルール違反 | `BUSINESS_RULE_ERROR` |
| 429 | レート制限 | `RATE_LIMITED` |
| 500 | サーバーエラー | `INTERNAL_ERROR` |

## 共通エラーハンドラ

```typescript
// src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: 'サーバーエラーが発生しました', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
```

## 使用例

```typescript
// 認証チェック
if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'ログインが必要です')

// テナント分離
if (resource.tenant_id !== tenantId) {
  throw new ApiError(403, 'FORBIDDEN', 'このリソースにアクセスする権限がありません')
}

// ビジネスルール
if (ticket.remaining_count <= 0) {
  throw new ApiError(422, 'BUSINESS_RULE_ERROR', '回数券の残回数がありません')
}

// ダブルブッキング
if (hasConflict) {
  throw new ApiError(409, 'CONFLICT', 'この時間帯は既に予約が入っています')
}
```

## フロントエンドでの処理

```typescript
// src/lib/fetch-api.ts
export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      body.code || 'UNKNOWN',
      body.error || 'エラーが発生しました'
    )
  }

  return res.json()
}
```

## Toast通知との連携

```typescript
// エラー時はtoastで表示
try {
  await fetchApi('/api/reservations', { method: 'POST', body: ... })
  toast.success('予約が完了しました')
} catch (e) {
  if (e instanceof ApiError) {
    toast.error(e.message)  // 日本語メッセージがそのまま表示される
  }
}
```
