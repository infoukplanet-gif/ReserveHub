# 技術仕様書

## 技術スタック

```
フロントエンド
├── Next.js 15 (App Router)
├── TypeScript
├── Tailwind CSS
├── shadcn/ui（UIコンポーネント）
├── React Hook Form + Zod（フォーム+バリデーション）
├── TanStack Query（データフェッチ）
├── FullCalendar（カレンダーUI）
└── Tiptap（ブログエディタ）

バックエンド
├── Supabase
│   ├── PostgreSQL（データベース）
│   ├── Auth（認証）
│   ├── Storage（画像アップロード）
│   ├── Edge Functions（サーバーレスAPI）
│   └── Realtime（リアルタイム更新）
├── Prisma（ORM / マイグレーション）
└── Resend（メール送信）

インフラ
├── Vercel（フロントエンドホスティング）
├── Supabase Cloud（バックエンド）
├── Cloudflare（独自ドメインDNS/SSL）
└── Upstash（Redis - レート制限/キャッシュ）

開発ツール
├── pnpm（パッケージマネージャ）
├── ESLint + Prettier
├── Vitest（ユニットテスト）
├── Playwright（E2Eテスト）
└── GitHub Actions（CI/CD）
```

## プロジェクト構成

```
reserve-app/
├── docs/                          # ドキュメント
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # 認証関連ページ
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/           # 事業者管理画面
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # ダッシュボード
│   │   │   ├── reservations/      # 予約管理
│   │   │   ├── menus/             # メニュー管理
│   │   │   ├── staff/             # スタッフ管理
│   │   │   ├── customers/         # 顧客管理
│   │   │   ├── tickets/           # 回数券管理
│   │   │   ├── homepage/          # HP設定
│   │   │   ├── blog/              # ブログ管理
│   │   │   └── settings/          # 各種設定
│   │   ├── (booking)/             # 顧客向け予約画面
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # 事業者HP
│   │   │       ├── menu/
│   │   │       ├── staff/
│   │   │       ├── book/          # 予約フロー
│   │   │       └── blog/
│   │   ├── api/                   # API Routes
│   │   │   ├── reservations/
│   │   │   ├── menus/
│   │   │   ├── customers/
│   │   │   ├── tickets/
│   │   │   ├── webhooks/
│   │   │   └── cron/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui
│   │   ├── booking/               # 予約関連
│   │   ├── dashboard/             # 管理画面関連
│   │   ├── homepage/              # HP関連
│   │   └── shared/                # 共通
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # ブラウザ用クライアント
│   │   │   ├── server.ts          # サーバー用クライアント
│   │   │   └── middleware.ts
│   │   ├── pricing.ts             # 料金計算ロジック
│   │   ├── availability.ts        # 空き枠計算ロジック
│   │   ├── validators/            # Zodスキーマ
│   │   └── utils.ts
│   ├── hooks/                     # カスタムフック
│   ├── types/                     # 型定義
│   └── styles/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── supabase/
│   ├── functions/                 # Edge Functions
│   └── migrations/                # SQL migrations
├── public/
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 認証フロー

```
事業者（オーナー/スタッフ）:
  メール+パスワード or Google OAuth
  → Supabase Auth
  → JWT に tenant_id を含める（app_metadata）
  → RLSでテナント分離

顧客:
  メール+パスワード（任意、ゲスト予約も可）
  → 予約時にメール入力 → 自動で顧客レコード作成
  → アカウント作成すると過去の予約履歴を紐付け
```

## デプロイメント

```
開発:     localhost:3000 + Supabase Local
ステージング: Vercel Preview + Supabase (staging project)
本番:     Vercel Production + Supabase (production project)

CI/CD:
  PR作成 → lint + type check + unit test → Preview deploy
  main merge → E2E test → Production deploy
```

## 月額コスト概算（初期）

| サービス | プラン | 月額 |
|---|---|---|
| Vercel | Hobby (→Pro) | $0 (→$20) |
| Supabase | Free (→Pro) | $0 (→$25) |
| Resend | Free (→Pro) | $0 (→$20) |
| Upstash | Free | $0 |
| ドメイン | .com | ~$12/年 |
| **合計（初期）** | | **ほぼ$0** |
| **合計（有料化後）** | | **~$65/月** |
