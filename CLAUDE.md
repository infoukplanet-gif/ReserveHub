# ReserveHub — 予約管理 × ホームページ × 顧客管理

## プロジェクト概要
中小事業者向けの予約管理Webアプリ。料金設定の柔軟性（平日/休日、時間帯、オプション、指名料）を最大の差別化ポイントとする。

## 技術スタック
- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Prisma (ORM)
- Tailwind CSS + shadcn/ui
- TanStack Query
- Vercel (ホスティング)

## ドキュメント
- `docs/01_requirements.md` — 要件定義
- `docs/02_specification.md` — 機能仕様書
- `docs/03_db_schema.md` — DB詳細仕様書
- `docs/04_tech_stack.md` — 技術仕様書
- `docs/05_api_spec.md` — API仕様書
- `docs/06_design_spec.md` — デザイン仕様書
- `docs/changelog.md` — 意思決定・知見の時系列ログ
- `design/DESIGN.md` — Stitch用デザインシステム
- `design/design_sample/` — Stitchで生成したデザインサンプル（HTML+PNG）

## 開発組織（Company形式）

### 統括
- **`cto`** — 全体統括・技術判断・Agent間調整。開発作業の起点。「作って」「進めて」で起動

### 計画・意思決定
- **`planner`** — 機能→タスク分解、実装順序決定、ロードマップ
- **`think-tank`** — 設計判断・技術選定前のマルチペルソナ討論

### 開発チーム
- **`backend-dev`** — API、DB、ビジネスロジック。src/app/api/, src/lib/, prisma/ で自動起動
- **`frontend-dev`** — UI実装。src/app/, src/components/ で自動起動

### 品質保証
- **`reviewer`** — コードレビュー。コード変更後に自動起動
- **`qa`** — テスト作成・実行・バグ検出

### 標準開発フロー
```
ユーザー: 「○○を作って」
  → cto: 仕様確認 → planner でタスク分解
  → backend-dev: DB + API 実装
  → qa: ユニットテスト
  → frontend-dev: UI 実装（デザインサンプル参照）
  → reviewer: コードレビュー
  → qa: E2E テスト
  → /commit-smart: コミット
```

## スキル

### 開発
- `/init-project` — プロジェクト初期セットアップ
- `/gen-migration [テーブル名]` — Prismaマイグレーション生成
- `/gen-api [エンドポイント]` — API Route生成（references/error-handling.md 参照）
- `/gen-component [コンポーネント名]` — Reactコンポーネント生成（references/patterns.md 参照）
- `/db-seed [small/medium/large]` — テストデータ生成・投入
- `/commit-smart` — セマンティックConventional Commit作成

### 品質
- `/review` — 最新の変更をレビュー
- `/debug [症状]` — 体系的デバッグワークフロー
- `/kaizen` — 継続的改善の指針
- `/reducing-entropy` — コード削減・肥大化防止
- `/seo-check [URL]` — SEO・パフォーマンス監査

### 運用
- `/deploy [staging/production]` — デプロイチェックリスト
- `/retrospective` — 会話の振り返り（知見記録、Agent/Skill更新提案）
- `/update-agents` — Agents/Skillsを更新

## 振り返りサイクル（重要）
1. **毎回の会話終了時**: `/retrospective` を実行
2. **Agent/Skill更新が必要なら**: `/update-agents` で反映
3. **仕様変更があれば**: docs/ も更新

**この振り返りは会話が終わる前に必ず実行すること。ユーザーが忘れていたら提案すること。**

## 開発ルール
- 仕様書（docs/）を常に参照して実装
- デザインは design/design_sample/ のHTML/PNGを参照して実装
- テナント分離（tenant_id）を絶対に忘れない
- 料金計算の優先順位: 曜日×時間帯 > 時間帯 > 曜日 > ベース料金
- 回数券はメニュー本体のみ消化、オプション・指名料は別会計
- any型禁止、型安全を徹底
- コンポーネントはshadcn/uiを優先使用
- エラーハンドリングは統一パターン（gen-api/references/error-handling.md）
- SKILL.mdは500行以内、詳細はreferences/に分離（Progressive Disclosure）
- 動く → 読みやすい → 効率的の順で（Kaizen）
- 「将来必要かも」は作らない（YAGNI）
- 変更後のコード総量が減る方向を意識（Reducing Entropy）
