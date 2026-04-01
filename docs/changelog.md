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
- [ ] ブログをTiptapブロックエディタに（note風）
- [ ] HP設定セクション詳細編集
- [ ] HTML直接編集モード
- [ ] Supabase Auth実装
- [ ] API×フロントエンド接続
- [ ] デプロイ（Vercel）
