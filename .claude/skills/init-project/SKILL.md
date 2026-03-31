---
name: init-project
description: ReserveHubプロジェクトの初期セットアップを実行する。Next.js + Supabase + Prisma + shadcn/ui の構築。プロジェクト開始時に1回だけ使う。
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# プロジェクト初期化

## 前提条件の確認

```bash
node -v    # v20+ 必須
pnpm -v    # なければ npm install -g pnpm
git -v
```

## Step 1: Next.js プロジェクト作成

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

## Step 2: 依存関係インストール

```bash
# Core
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add @prisma/client
pnpm add @tanstack/react-query
pnpm add zod react-hook-form @hookform/resolvers
pnpm add resend

# UI
pnpm add @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image

# Dev
pnpm add -D prisma
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D playwright @playwright/test
pnpm add -D @upstash/ratelimit @upstash/redis
```

## Step 3: shadcn/ui 初期化

```bash
pnpm dlx shadcn@latest init -d
```

よく使うコンポーネントを追加:
```bash
pnpm dlx shadcn@latest add button card dialog form input label select separator sheet sidebar skeleton table tabs textarea toast calendar popover badge avatar dropdown-menu
```

## Step 4: Supabase 初期化

```bash
pnpm add -D supabase
npx supabase init
npx supabase start
```

## Step 5: Prisma 初期化

```bash
npx prisma init --datasource-provider postgresql
```

prisma/schema.prisma の datasource を Supabase に向ける:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Step 6: 環境変数

.env.local を .env.local.example からコピーして値を設定。

## Step 7: ディレクトリ構造作成

docs/04_tech_stack.md のプロジェクト構成に従って、以下を作成:
```
src/
├── app/(auth)/
├── app/(dashboard)/
├── app/(booking)/
├── app/api/
├── components/ui/
├── components/booking/
├── components/dashboard/
├── components/homepage/
├── components/shared/
├── lib/supabase/
├── lib/validators/
├── hooks/
├── types/
└── styles/
```

## Step 8: Supabase クライアント設定

src/lib/supabase/client.ts と src/lib/supabase/server.ts を作成。
docs/04_tech_stack.md の認証フローに従う。

## Step 9: 動作確認

```bash
pnpm dev
# http://localhost:3000 で Next.js が起動することを確認
npx supabase status
# Supabase ローカルが起動していることを確認
```

## 完了チェック
- [ ] Next.js がビルドエラーなしで起動する
- [ ] shadcn/ui コンポーネントが使える
- [ ] Supabase に接続できる
- [ ] Prisma migrate dev が通る
- [ ] .env.local が設定されている
- [ ] .gitignore に .env.local が含まれている
