---
name: gen-api
description: API仕様書に基づいてNext.js API Routeを生成する。新規エンドポイント作成時に使う。
argument-hint: "[エンドポイント名 例: POST /api/reservations]"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

docs/05_api_spec.md の仕様に基づいて、「$ARGUMENTS」のAPI Routeを実装してください。

## 手順
1. docs/05_api_spec.md で該当エンドポイントの仕様を確認
2. src/app/api/ 配下に route.ts を作成
3. Zodバリデーションスキーマを src/lib/validators/ に作成
4. ビジネスロジックが必要な場合は src/lib/ に切り出す
5. 型定義を src/types/ に追加

## テンプレート構造
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({...})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  // 実装
}
```

## ルール
- 認証チェック必須（公開APIを除く）
- tenant_id のフィルタ必須
- 入力バリデーション必須（Zod）
- 適切なHTTPステータスコード
- エラーメッセージは日本語対応
