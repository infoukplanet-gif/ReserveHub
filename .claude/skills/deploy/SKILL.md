---
name: deploy
description: Vercel + Supabase へのデプロイチェックリスト。リリース時に使う。「デプロイ」「リリース」「本番」でもトリガーする。
argument-hint: "[staging or production]"
user-invocable: true
allowed-tools: Read, Bash, Grep, Glob
---

# デプロイチェックリスト

対象環境: $ARGUMENTS（デフォルト: staging）

## Pre-deploy チェック

### 1. コード品質
```bash
pnpm type-check        # TypeScript型チェック
pnpm lint              # ESLint
pnpm test              # ユニットテスト
pnpm test:e2e          # E2Eテスト（staging のみ省略可）
```

全部通るまでデプロイしない。

### 2. git 状態
```bash
git status             # 未コミットの変更がないか
git log --oneline -5   # 最新のコミットを確認
```

### 3. 環境変数
Vercel に以下が設定されているか確認:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL
RESEND_API_KEY
```

### 4. DBマイグレーション
```bash
# 未適用のマイグレーションがないか
npx prisma migrate status

# 本番DBにマイグレーション適用（production の場合）
npx prisma migrate deploy
```

### 5. Supabase
```bash
# RLSが全テーブルで有効か
# Edge Functions のデプロイ
npx supabase functions deploy
```

## デプロイ実行

### Staging
```bash
vercel                  # Preview deploy
# URLを確認して動作テスト
```

### Production
```bash
vercel --prod           # Production deploy
```

## Post-deploy チェック

- [ ] トップページが表示される
- [ ] ログインできる
- [ ] 予約フローが動く（テスト予約）
- [ ] 管理画面が表示される
- [ ] API エンドポイントが応答する
- [ ] カスタムドメインが正しく動く（設定済みの場合）
- [ ] OGP/SEOメタタグが正しい

## ロールバック

問題があった場合:
```bash
vercel ls               # デプロイ一覧
vercel rollback          # 直前のデプロイに戻す
```

## 出力

```
## デプロイ結果: [staging/production]

- URL: https://...
- コミット: [hash] [message]
- Pre-deploy: ✅ 全チェック通過
- Post-deploy: ✅ / ❌ [問題があれば詳細]
- 所要時間: X分
```
