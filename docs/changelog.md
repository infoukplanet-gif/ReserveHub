# 変更ログ（Changelog）

プロジェクトの意思決定・知見・学びを時系列で記録する。
AgentsとSkillsの更新判断に使用。

---

## 2026-03-31 — プロジェクト立ち上げ・初期設計

### 決定事項
- プロダクト名（仮）: ReserveHub
- コンセプト: 予約管理 × ホームページ × 顧客管理の一体型Webアプリ
- 最大の差別化: 料金設定の柔軟性（曜日×時間帯、オプション、指名料を1メニューで管理）
- ターゲット: 業種を限定しない（市場が特化先を教えてくれる戦略）
- 技術スタック: Next.js 15 + Supabase + Prisma + Tailwind CSS + shadcn/ui
- 回数券はメニュー本体のみ消化、オプション・指名料は別会計

### 新しい知見（競合分析）
- **STORES予約**: 実際に使用経験あり。平日/休日で料金を変えるには別メニュー作成が必要。オプション料金の自由度が低い
- **RESERVA**: 実際に使用経験あり。同様の柔軟性不足
- **SelectType**: 月1,650円〜。170業種テンプレート、回数券・サブスク対応。ただし料金の柔軟性の実態は未検証
- **invoy**: 見積・請求書は圧倒的に良い。この領域では勝負しない
- **KING OF TIME**: 勤怠は圧倒的コスパ。この領域では勝負しない
- **freee**: 承認フローはfreeeの領域。正面から戦わない

### ビジネス戦略の知見
- 鍼灸・整体・カメラマンは予算にシビア（月5,000円でも渋る）。高単価業種（ジム、エステ、クリニック）のほうがLTVが高い
- 最初から業種特化しない → 「半特化」戦略（汎用で作り、反応の良い業種に後から寄せる）
- Webアプリは集客装置+信頼構築+ニーズ発掘の3役。御用聞きで案件を広げる入口

### 将来のプロダクト構想
- 2本目: 現場系の日報+写真報告+タスク管理（競合が手薄）
- 3本目: 顧客管理（予約管理の付加機能としてまず提供、単体化は後）

### 課題・TODO
- [ ] SelectTypeに無料登録して実際の操作感を確認する
- [ ] パーソナルジム/ピラティス等の体験レッスンに行き、予約体験を観察する
- [ ] プロダクト名の正式決定
- [ ] MVP開発着手

### 開発ルールの追加・変更
- 初回設定のため、全ルールが新規

---

## 2026-03-31〜04-02 — MVP開発（Phase 1+2 完了）

### 決定事項
- プロダクト名正式決定: **ReserveHub**
- GitHub: https://github.com/infoukplanet-gif/ReserveHub
- Supabase: nkdrxtqdnzezdxqftvgw（東京リージョン、Nano）
- Prisma v7 使用（v6以前とはconfig方式が異なる。prisma.config.tsにDB URLを記述）
- Supabaseの新しいキー形式: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`（sb_publishable_*）
- DB接続はPooler経由（IPv6のみのため直接接続不可。aws-1-ap-northeast-1.pooler.supabase.com）
- マイグレーションはDIRECT_URL（ポート5432）を使用。DATABASE_URL（ポート6543、pgbouncer）はランタイム用
- デザインシステム: グラデーション全面禁止、AI臭さ排除、Notion/Linear/Stripe方向のフラット・ソリッド
- Google Stitchでデザインサンプル作成済み（22画面分のHTML+PNG）
- Company形式のAgent組織体制: CTO→planner/backend-dev/frontend-dev/reviewer/qa/think-tank

### 新しい知見（技術）
- Prisma v7は`datasource`の`url`/`directUrl`をschema.prismaではなくprisma.config.tsに書く
- Prisma v7のPrismaClientはコンストラクタ引数が変わった（`new PrismaClient()`は`any`キャストが必要）
- Supabase新規プロジェクトはIPv6のみでDNS解決される。直接接続（db.xxx.supabase.co:5432）はIPv4環境から到達不可
- Supabase Poolerのホスト名はリージョンで異なる（東京は`aws-1-ap-northeast-1`、`aws-0`ではない）
- Supabaseの「Network restrictions」がデフォルトで外部アクセスブロック。「Allow all access」が必要
- dotenvの.env.local読み込み: `dotenv.config({ path: ".env.local" })`
- パスワードに@が含まれる場合、URLエンコード（%40）が必要
- shadcn/ui v2ではSheetTriggerのasChildが非対応。直接子要素を渡す

### 完了した作業
- [x] MVP開発着手（課題TODOから消化）
- [x] Next.js 15 + Supabase + Prisma + shadcn/ui(26コンポーネント) セットアップ
- [x] 18テーブルのDBスキーマ設計・マイグレーション完了
- [x] 料金計算エンジン（pricing.ts）— 15ユニットテスト
- [x] 空き枠計算エンジン（availability.ts）— 8ユニットテスト
- [x] メニューAPI（CRUD + 料金ルール + オプション）
- [x] スタッフAPI（一覧 + 作成）
- [x] 予約API（作成 + 一覧 + 詳細 + 更新 + ダブルブッキング防止 + 回数券消化）
- [x] 空き枠API
- [x] 管理画面10画面（ダッシュボード、予約、メニュー、スタッフ、顧客、回数券、HP設定、設定3種）
- [x] 予約フロー6ステップ（顧客向け）
- [x] 認証画面（ログイン + 新規登録）
- [x] Stitch MCP + Supabase MCP 接続
- [x] GitHub 8コミット push済み

### 課題・TODO
- [ ] SelectTypeに無料登録して実際の操作感を確認する
- [ ] パーソナルジム/ピラティス等の体験レッスンに行き、予約体験を観察する
- [ ] Supabase Auth実装（現在はモック。ログイン/登録のTODO箇所）
- [ ] APIとフロントエンドの接続（現在は仮データ。fetchでAPI呼び出しに置き換え）
- [ ] テナント認証の共通化（getTenantId()が全APIで暫定実装）
- [ ] メニュー編集画面のオプション追加UI（現在は表示のみ）
- [ ] 予約フローのAPI接続（現在は仮データ）
- [ ] HP公開ページの実装（/[slug] のSSR）
- [ ] メール送信実装（Resend）
- [ ] Stripe決済連携（P1）
- [ ] LINE連携（P1）
- [ ] デプロイ（Vercel）
- [ ] seedデータ投入
- [ ] E2Eテスト
- [ ] APIキー・トークンのローテーション（Stitch APIキー、GitHub PAT、Supabase service_role keyがチャット履歴に残っている）

### 失敗・修正から学んだこと
- Prisma v7の設定方式の変更に気づくのに時間がかかった → 新しいバージョンのマイグレーション手順は公式ドキュメントを先に確認すべき
- SupabaseのIPv6問題でDB接続に苦労した → Pooler経由が正解。Connectボタンの「ORM」タブの接続文字列をそのまま使うのが最速
- ダッシュボードの初版が「余白が多くダサい」とフィードバック → Stitchデザインに寄せてコンパクトに修正。デザインサンプルを先に確認してから実装すべき
- メニュー編集のラベルとフォームの行間が窮屈 → space-y-2をdivに追加。フォーム項目は必ずspace-y-2でラベルとインプットを囲む

### 開発ルールの追加・変更
- フォーム項目は `<div className="space-y-2">` でラベルとインプットを囲む（行間確保）
- セクション間は `space-y-6`、項目間は `space-y-5`（Card内）
- ダッシュボード等のデータ表示画面はStitchデザインサンプルを先に確認してから実装
- Supabase接続は必ずPooler経由（DIRECT_URLはマイグレーション専用）
- DB関連のエラーが出たらまず「Connect」ボタンのORM接続文字列を確認

---

## 2026-04-02 — UIフィードバック・不足画面追加

### 完了
- カルテ設定タブ、売上レポート、ブログ管理、手動予約Sheet、回数券作成Sheet
- 回数券カードの余白修正

### ユーザーフィードバック（次回対応）
1. **ブログ**: noteのようなブロック型エディタ（Tiptap + スラッシュコマンド、左に目次サイドバー）
2. **HP設定**: セクション表示/非表示だけでなく中身（テキスト、アイコン）の詳細編集
3. **HTML直接編集**: 上級者向け。プロプラン以上
4. **スタッフ新規追加**: 「+」ボタンからSheet

### 次回TODO（優先順位順）
- [x] ブログをTiptapブロックエディタに（note風）
- [x] HP設定セクション詳細編集
- [x] HTML直接編集モード
- [x] Supabase Auth実装
- [x] API×フロントエンド接続
- [x] デプロイ（Vercel）

---

## 2026-04-02 — API全接続・認証・HP公開ページ・デプロイ完了

### 完了した作業
- [x] 全不足API作成（顧客、回数券、ブログ、設定、HP設定、売上集計、テナント作成、ダッシュボード）計13エンドポイント
- [x] 全14画面の仮データをAPI接続に置換（仮データゼロ）
- [x] ダッシュボード統計を実データから集計
- [x] 認証基盤: getAuthenticatedTenantId()で全16APIのテナント認証化
- [x] 認証ガード: /dashboard未認証→/loginリダイレクト
- [x] ログアウト機能（API + サイドバーボタン）
- [x] 予約フロー（顧客向け）をAPI接続（メニュー/スタッフ/空き枠/予約作成を実データ化）
- [x] 画像アップロード共通コンポーネント（Supabase Storage）
- [x] HP公開サブページ SSR: /[slug]/menu, /[slug]/staff, /[slug]/blog, /[slug]/blog/[id]
- [x] Vercelデプロイ（本番: https://reserve-app-mu.vercel.app）
- [x] seedデータ投入（BLOOM salon）
- [x] ビルドエラー修正（Prisma v7 PG adapter、useSearchParams SSG、force-dynamic）

### 技術的知見
- Prisma v7はPrismaClientにadapterが必須。@prisma/adapter-pg + pgを使う
- 全APIルートに`export const dynamic = 'force-dynamic'`が必要（SSGでDB接続エラー回避）
- useSearchParams()はSSGページで使えない。window.location.searchで代替するか、Suspenseで囲む
- Vercelデプロイは環境変数（DATABASE_URL等）がないとビルド失敗する。Settings → Environment Variablesで事前設定
- 認証ガードはmiddlewareでcookieの有無をチェック（簡易版。本番ではsupabase.auth.getUser()でサーバー側検証すべき）

### 残タスク（優先順位順）
- [x] メール通知（Resend: 予約確認、リマインド、キャンセル）
- [x] 不足API（カルテ記録、回数券販売、スタッフ編集削除）
- [x] RLSポリシー準備
- [x] パスワードリセット画面
- [x] HP大改修（ナビ/ヒーロー/セクション/Map/アニメ/フッター/SEO/カスタムコード）

---

## 2026-04-02（3回目）— メール通知・不足API・HP大改修

### 完了
- メール通知4種（Resend: 予約確認、リマインド、キャンセル、スタッフ通知）+ 遅延初期化
- Vercel Cron（毎日リマインドメール送信）
- 不足API: カルテ記録作成、回数券販売、スタッフ編集/削除
- パスワードリセット画面
- RLSポリシーSQL（26テーブル）
- HP大改修:
  - DB: hp_settingsに15カラム追加（nav_type, hero_type, hero_images, animation_level等）
  - 管理画面: 8タブUI（ナビ/ヒーロー/セクション/マップ/アニメ/フッター/SEO/コード）
  - 公開ページ: 全設定SSR反映、Google Map埋め込み（スタイル対応）、JSON-LD構造化データ（AIO対応）、動的OGP
  - ImageUploadコンポーネント組み込み（ヒーロー、セクション背景、OGP）

### 技術的知見
- Resendは遅延初期化必須（getResend()パターン）。APIキーなしでnew Resend()するとビルド時エラー
- Vercel CronはPOSTエンドポイント + authorization headerで認証。vercel.jsonのcrons配列で設定
- Slider（shadcn）のonValueChangeの型は`number | number[]`。`(v as number[])[0]`でキャスト必要
- Google Map Embedはiframeで簡単に埋め込み可能（APIキー不要）。grayscale/invertのCSSフィルタでスタイル変更

### 残タスク
- [ ] E2Eテスト（Playwright）
- [ ] LP・利用規約・料金ページ
- [ ] 独自ドメイン
- [ ] Supabase Storageのバケット作成（uploadsバケット）
- [ ] 不足UIのフロント接続（カルテ記録フォーム、回数券販売フォーム等）
- [ ] Stripe決済連携（P1）
- [ ] LINE連携（P1）
- [ ] 営業開始リサーチ（SelectType調査、体験レッスン）
- [ ] 不足UI（オプション追加フォーム、カルテ記録作成、回数券販売、顧客タグ追加削除、特別日追加、メニュー削除確認、ブログ削除、手動予約のAPI接続）
- [ ] RLSポリシー設定（テナント分離をDB層で保証）
- [ ] パスワードリセット画面
- [ ] HP大改修（下記「HPカスタマイズ仕様」参照）
- [ ] HP: OGP動的生成、sitemap.xml、robots.txt
- [ ] E2Eテスト
- [ ] LP・利用規約・料金ページ
- [ ] 独自ドメイン → 営業開始

---

## HPカスタマイズ仕様（次回実装）

**コンセプト: 「テンプレ感ゼロ、オリジナリティを出せる柔軟なHP」**

事業者が管理画面から設定するだけで、競合と差別化できるHPを作れる仕組み。

### ナビゲーション設定
事業者が選べる:
- **ヘッダー固定ナビ**（デフォルト）
- **ハンバーガーメニュー**（モバイル風、全画面オーバーレイ）
- **フッターナビ**（モバイルアプリ風、下部固定タブ）
- **サイドナビ**（縦型、左固定）
- ナビ項目の表示/非表示、並び替え、ラベル変更

### ヒーローセクション設定
- **タイプ選択**:
  - 静止画1枚
  - スライドショー（複数画像、自動切替、フェード or スライド）
  - 動画背景
  - テキストのみ（ミニマル）
- オーバーレイ色・透明度
- テキスト配置（左寄せ/中央/右寄せ）
- CTAボタンのスタイル（角丸、サイズ、色）

### セクションごとのカスタマイズ
各セクション共通:
- **背景色/背景画像** の設定
- **見出しテキスト** のカスタマイズ
- **表示/非表示**、並び替え
- セクション間の余白（狭い/普通/広い）

特徴セクション:
- カード数（2/3/4列）
- アイコン or 画像 の選択
- カードスタイル（ボーダー/影/フラット）

メニューセクション:
- 表示件数
- カードスタイル（リスト/グリッド/画像付き）
- 料金表示形式（〜表示/テーブル形式）

スタッフセクション:
- プロフィール写真（丸/四角/なし）
- 表示情報の選択（指名料表示、自己紹介表示）

### Google Map設定
- **スタイル選択**: デフォルト/モノクロ/ダーク/カスタム
- ズームレベル
- マーカーのカスタマイズ（色、アイコン）
- 周辺情報の表示/非表示
- Google Maps Embed API使用（APIキー不要、iframe）→ 将来的にMaps JavaScript APIに移行

### アニメーション設定
事業者が選べるレベル:
- **なし**: アニメーション完全OFF
- **控えめ**: スクロールでfade-in（Intersection Observer）
- **標準**: fade-in + slide-up、ステッカーヘッダー
- カスタム: セクションごとにON/OFF

### フッター設定
- レイアウト: 1カラム/2カラム/3カラム
- SNSリンク（Instagram, LINE, X等）
- 営業時間表示
- Google Map小表示
- コピーライトテキスト
- 「Powered by ReserveHub」の表示/非表示（プロプラン以上で非表示可）

### カスタムコード（プロプラン）
- カスタムHTML（headに挿入）
- カスタムCSS
- Google Tag Manager
- Facebook Pixel

### DB設計の追加
hp_settingsテーブルに以下を追加:
```
nav_type: 'header' | 'hamburger' | 'footer' | 'side'
hero_type: 'image' | 'slideshow' | 'video' | 'text'
hero_images: jsonb (複数画像URL配列)
hero_overlay_color: varchar
hero_overlay_opacity: decimal
hero_text_align: 'left' | 'center' | 'right'
animation_level: 'none' | 'subtle' | 'standard'
map_style: 'default' | 'mono' | 'dark'
map_zoom: int
footer_layout: '1col' | '2col' | '3col'
footer_sns: jsonb (SNSリンク配列)
custom_head_html: text
custom_css: text
section_config: jsonb (セクションごとの詳細設定)
```
- [ ] E2Eテスト（Playwright）
- [ ] エラーモニタリング（Sentry）
- [ ] LP・利用規約・料金ページ
- [ ] 独自ドメイン設定
- [ ] Stripe決済連携（P1）
- [ ] LINE連携（P1）
- [ ] SelectType競合調査、体験レッスンリサーチ

### 開発ルール追加
- APIルートは必ず`export const dynamic = 'force-dynamic'`を先頭に
- getTenantId()は使わない。getAuthenticatedTenantId()を使う（@/lib/auth）
- 画像アップロードはImageUploadコンポーネント（@/components/shared/ImageUpload）を使う
- HP公開ページはSSR（Server Component）で実装。クライアントコンポーネントにしない

---

## 2026-04-03 — 残タスク一括消化・認証フロー修正

### 決定事項
- LPの料金プラン: Free(¥0) / Standard(¥2,980) / Pro(¥5,980) の3プラン構成
- 新規登録フロー: signUp → signIn試行 → テナント自動作成 → dashboard遷移
- Google OAuth: callbackでテナント未存在なら自動作成（slug=メール@前をslugify）
- E2Eテスト基盤: Playwright + Chromium、`pnpm test:e2e` で実行
- エラーモニタリング: Sentry導入（NEXT_PUBLIC_SENTRY_DSN環境変数で有効化）

### 完了した作業
- [x] 不足UI: 特別日追加/削除フォーム + API（/api/settings/special-dates）
- [x] 不足UI: 手動予約のメニュー・スタッフSelect選択（仮データ廃止）
- [x] 不足UI: 回数券販売Sheet（顧客選択+テンプレート選択→購入API）
- [x] sitemap.xml（テナント・ブログ記事を動的生成）
- [x] robots.txt（dashboard/api等をDisallow）
- [x] E2Eテスト基盤: 4テストファイル（認証、公開ページ、予約フロー、API）
- [x] LP（ランディングページ）: 機能紹介・料金プラン・CTA
- [x] 利用規約ページ（/terms）
- [x] プライバシーポリシーページ（/privacy）
- [x] 料金プランページ（/pricing）: 詳細比較・FAQ
- [x] Sentry導入: client/server config、global-error.tsx、instrumentation.ts
- [x] 認証フロー修正: 新規登録→テナント自動作成、OAuth callback→テナント自動作成
- [x] Vercelデプロイ（push済み）

### 新しい知見（技術）
- shadcn/ui v2のSelect: onValueChangeの型が`(value: string | null, ...) => void`に変更。`setXxx`を直接渡すと型エラー → `(v) => { if (v) setXxx(v) }` でラップ必要
- Next.js App Routerのsitemap.ts/robots.ts: export default関数でMetadataRoute型を返すだけで自動的にルート生成される
- Sentry + Next.js 16: @sentry/nextjs v10、withSentryConfigでnext.config.tsをラップ、instrumentation.tsでサーバー初期化
- Playwright: `pnpm add -D @playwright/test` → `npx playwright install chromium` でセットアップ完了

### 失敗・修正から学んだこと
- ユーザーから「並列でやって」と複数回指摘された → Agent toolを積極的に並列起動すべき。独立したタスク（ファイル作成、ビルド確認等）は同時実行が原則
- 認証フローのテナント自動作成が抜けていた → 新規登録時は必ず「認証後にDB側のリソースが作られるか」を確認すべき

### 課題・TODO（優先順位順）
- [ ] Google OAuth有効化（Google Cloud Console + Supabase Dashboard設定）
- [ ] Supabase Storageバケット作成（uploads）
- [ ] RLSポリシー適用（SQLは作成済み。Supabase Dashboard or マイグレーションで実行）
- [ ] 独自ドメイン設定
- [ ] Stripe決済連携
- [ ] LINE連携
- [ ] SelectType競合調査、体験レッスンリサーチ

### 開発ルールの追加・変更
- shadcn Select の onValueChange は `(v) => { if (v) setXxx(v) }` でラップする（直接setStateを渡さない）
- 認証フロー変更時は必ず「テナント自動作成」の整合性を確認する
- 並列実行可能な作業はAgent toolで同時に実行する（ユーザー体験向上）

---

## 2026-04-10 — 6機能一括実装 + ミナオスなびプラットフォーム

### 実装完了（1セッションで完了）

#### F1: 整体用カルテテンプレート
- `src/lib/carte-template-defaults.ts` — 整体院13項目/鍼灸院14項目のデフォルトテンプレート定義
- `src/components/carte/CarteFieldRenderer.tsx` — fieldType別レンダラー（text/textarea/select/multiselect/date/number/image）
- `src/components/carte/CarteForm.tsx` — テンプレート選択+フィールド入力+バリデーション
- `src/app/api/carte-templates/seed/route.ts` — テナントへのデフォルトテンプレートシード
- 顧客詳細ページ: カルテタブを構造化表示に改修（フィールド名+値の一覧表示）
- 設定ページ: 「整体・鍼灸テンプレを追加」ボタン追加

#### F2: 自動フォローアップ
- `FollowUpRule` / `FollowUpLog` モデル追加
- 4トリガータイプ: interval（来院N日後）、symptom（カルテキーワード）、season（月日指定）、ticket_expiry（回数券期限前）
- `src/lib/follow-up.ts` — 配信ロジック（全テナント横断処理）
- プリセット6件（7日/14日/30日リマインド、回数券期限、梅雨/冬の季節リマインド）
- `src/app/api/cron/follow-up/route.ts` — 専用Cron（毎日JST 10:00）
- ダッシュボード: ルール管理（CRUD+トグル）+ 送信ログ閲覧
- `sendFollowUp()` メールテンプレート追加

#### F3: Stripe課金
- Tenant: `stripeCustomerId`, `stripeSubscriptionId`, `trialEndsAt` 追加
- 3プラン: ライト¥1,980 / スタンダード¥4,980 / プロ¥9,800
- `src/lib/stripe.ts` — 初期化+Price定数
- `src/lib/plan-gate.ts` — プラン別機能制限チェック（maxCartes, followUp, lineIntegration, themes, customCss）
- Checkout Session / Billing Portal / Webhook（4イベント処理）
- 14日間無料トライアル対応
- ダッシュボード: プラン比較+決済ボタン+支払い管理

#### F4: LINE連携
- `LineConfig` / `ChatMessage` モデル追加、Customer.lineUserId追加
- `src/lib/line.ts` — 署名検証、メッセージ送信、プロフィール取得（raw fetch、SDK不使用）
- Webhook: メッセージ受信 → 顧客自動紐付け（lineUserId）、友だち追加時に自動Customer作成
- チャットUI: 顧客リスト（未読バッジ）+ バブルチャット + 5秒ポーリング
- 設定ページ: LINE連携タブ（Channel ID/Secret/Token + Webhook URL表示）
- フォローアップのLINE配信対応（follow-up.tsにLINEチャネル分岐追加）

#### F5: デザインテーマ切替
- 5テーマ: flat / skeuomorphic / neumorphic / glassmorphic / liquid-glass
- CSS変数オーバーライド方式（`[data-theme="xxx"]`セレクタ）
- `ThemeProvider` — data-theme属性管理のReactコンテキスト
- `ThemeSwitcher` — プレビュースウォッチ付きテーマ選択UI
- ダッシュボードレイアウトをThemeProviderでラップ
- 設定ページ: テーマ設定タブ追加

#### F6: ミナオスなびプラットフォーム
- `Review` / `PlatformBoost` / `PaidListing` / `PlatformUser` / `PlatformFavorite` / `PlatformDisclosure` モデル追加
- **掲載設計**: ReserveHub利用院は無料自動掲載 / 非利用院はPaidListingで有料掲載(basic/premium)
- **検索**: エリア×症状、premium掲載を上位表示
- **院詳細**: SSR + JSON-LD(LocalBusiness+AggregateRating) + Google Maps埋め込み
- **口コミ**: 投稿（承認制）→ 院側ダッシュボードで承認/拒否/公開管理
- **Google Maps連携**: Place ID設定、地図埋め込み、「Google Mapsで口コミを書く」CTA
- **ユーザーアカウント**: お気に入り、プロフィール、情報開示設定
- **情報開示管理**: 院ごとに6項目（氏名/生年月日/電話/性別/カルテ/施術履歴）をチェックボックスでオン/オフ。院名は開示しない設計。施術部位・問診情報のみ引き継ぎ。
- **デザイン**: モダンUI、hero-mesh背景、スクロールアニメーション(ScrollReveal)、stagger children、clinic-card hover、search-bar glow
- **アクセシビリティ**: prefers-reduced-motion対応

#### インフラ・SEO・テスト
- Prismaマイグレーション: 10テーブル新規作成、3テーブルカラム追加（1回のマイグレーションで適用）
- Vercel環境変数: Stripe関連6つ設定
- Stripe: 3商品作成、Webhookエンドポイント登録
- sitemap拡張: プラットフォーム院詳細/口コミ、症状別8ページ、エリア別8ページ
- robots.txt: /clinics/ allow、/mypage disallow
- E2Eテスト: プラットフォーム(検索/404/マイページ)、API(検索/口コミ/課金/フォローアップ/LINE/口コミ管理)

### 新しい知見
- Stripe v22では `subscription.current_period_end` がTypeScript型に含まれない → キャストで対応
- Prisma migrate devはnon-interactive環境で使えない → 手動でmigration.sqlを作成し`migrate deploy`で適用
- Google Maps口コミの自動連携はGoogleの規約で禁止 → 投稿後に誘導ボタンが最善策
- shadcn Selectの`onValueChange`は`null`を返しうるので`if (v) { ... }`でガードが必要
- ScrollRevealはサーバーコンポーネントから使えないが、子コンポーネントとして埋め込み可能

### ユーザーからの要望・フィードバック
- プロプラン: 12,000円 → 9,800円に変更
- ミナオスなび: ReserveHub利用者は無料自動掲載、非利用院は有料掲載
- ミナオスなび: 最新トレンドデザイン・アニメーションを希望
- ミナオスなび: ノンストレスで院にたどり着ける設計
- 情報開示: 他院の来院履歴で院名は開示しない。施術部位・問診情報のみ引き継ぎ
- Stripe Connect（院が患者から決済を受け取る仕組み）は後回し

### 課題・TODO（優先順位順）
- [ ] Stripe Connect実装（院が患者からオンライン決済を受け取る）
- [ ] Google OAuth有効化
- [ ] Supabase Storageバケット作成（uploads）
- [ ] RLSポリシー適用
- [ ] 独自ドメイン設定
- [ ] ミナオスなびの有料掲載申込フロー（PaidListing用Checkout）
- [ ] PlatformUser認証フロー（患者側ログイン/登録）
- [ ] 口コミを認証済みユーザー限定に変更（スパム防止）
- [ ] LINE Rich Menu設定サポート
- [ ] 設定代行サービス申込フロー

### 開発ルールの追加
- Stripe Webhookはraw body（`req.text()`）で署名検証。JSONパースは署名検証後に行う
- Prismaマイグレーションはnon-interactive環境では手動SQL作成+`migrate deploy`で適用
- プラットフォーム系ページはSSRを基本とし、JSON-LD構造化データを必ず出力
- `useSearchParams()`を使うページは`<Suspense>`で必ずラップ（Next.js 16要件）

---

## 2026-04-11 — 残タスク一括消化 + UIフィードバック全13件 + カレンダー改善

### 決定事項
- LINE Rich Menu制作は外注。アプリ内にヒアリングフォーム（分割数/ボタン内容/デザイン雰囲気/参考画像/ブランドカラー/その他）→ 大野さんにメール通知 → 外注
- LINE設定代行: ¥5,000（税込）、Rich Menu制作依頼: ¥10,000〜（税込）
- 「施術者管理」→「スタッフ管理」にリネーム
- PlatformUser（患者側）のログイン/登録パス: `/platform-login`, `/platform-register`（route group競合回避）

### 完了した作業
- [x] RLSポリシー全36テーブル対応 + ヘルパー関数 + Storageバケット作成SQL
- [x] auth.ts 開発用フォールバック除去（セキュリティ修正）
- [x] middleware.ts に /mypage 認証ガード追加
- [x] Stripe Connect Express実装（onboard/status/checkout API + stripe-connect.ts + Webhook）
- [x] PlatformUser認証フロー（/platform-login, /platform-register, auth callback分岐）
- [x] 口コミ投稿を認証済みPlatformUser限定に変更
- [x] ミナオスなび有料掲載申込（/list-your-clinic + Stripe Checkout + Webhook自動作成）
- [x] 設定代行サービス申込（ServiceRequestモデル + API + ヒアリングフォーム + メール通知）
- [x] Prismaマイグレーション（ServiceRequest, Stripe Connectカラム, Review.platformUserId）
- [x] サイドメニューをグループ分け（予約・施術/患者/コミュニケーション/サイト/管理）
- [x] 設定サブメニュー削除 + タブURL連携修正（useSearchParams）
- [x] 課金プランカードのレスポンシブ修正 + 人気バッジ見切れ修正
- [x] HP公開ページにブログセクション追加 + force-dynamic追加
- [x] ブログにスラッグ設定 + カテゴリー6種に拡張
- [x] フォローアップ→チャット履歴連動（LINE送信時にchat_messagesにも記録）
- [x] 来院予約に統計カード + アイコン付きタブ + ナビボタン改善
- [x] スタッフフォームをセクション分け（基本情報/プロフィール/料金/表示設定）
- [x] チャット文字化け修正（チャ���ト→チャット）
- [x] カスタムDatePickerコンポーネント（日本語対応、曜日色分け、今日マーカー）

### 新しい知見（技術）
- Next.js 16でroute group内の同名パスが競合する → `/platform-login` のように一意にする
- `createBrowserClient`をコンポーネントトップレベルで呼ぶとSSG時にビルド失敗 → `getSupabase()` で遅延初期化
- Vercel Git連携が切れている場合 → `npx vercel --prod` で手動デプロイ可能
- `overflow-hidden` + `absolute -top-N` でバッジ見切れ → カード内配置が正解
- JSX編集で閉じタグ不整合 → Vercelビルド失敗。ローカルビルドは通るがTurbopackで検出される場合がある

### 課題・TODO（優先順位順）
- [ ] Vercel Git連携の修正（pushで自動デプロイされるようにする）
- [ ] Google OAuth有効化（Google Cloud Console + Supabase Dashboard設定）
- [ ] Supabase SQL EditorでRLSポリシー適用（rls-policies.sql実行）
- [ ] Supabase SQL Editorでマイグレーション適用（migration.sql実行）
- [ ] 独自ドメイン設定
- [ ] Stripe Webhook に account.updated イベント追加
- [ ] Stripe Connect 環境変数設定

### 開発ルールの追加・変更
- route group内で同名パスを作らない（`/(auth)/login` と `/(platform)/login` は競合する）
- `createBrowserClient` は関数ラップ（`getSupabase()`）で遅延初期化
- CSSの `overflow-hidden` 使用時は `absolute` 配置の子要素が見切れないか確認
- JSX編集後は閉じタグの整合性を確認してからcommit
- Vercelデプロイが反映されない場合は `npx vercel --prod` で手動デプロイ
