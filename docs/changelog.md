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
- [ ] メール通知（Resend: 予約確認、リマインド、キャンセル）
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
