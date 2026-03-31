---
name: gen-component
description: 仕様書に基づいてReactコンポーネントを生成する。画面・UIパーツ作成時に使う。
argument-hint: "[コンポーネント名 例: MenuSelector, ReservationCalendar]"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

docs/02_specification.md の仕様に基づいて、「$ARGUMENTS」コンポーネントを実装してください。

## 手順
1. docs/02_specification.md で該当画面/機能の仕様を確認
2. 適切なディレクトリにコンポーネントを作成
3. shadcn/ui コンポーネントを活用
4. 必要な型定義を src/types/ に追加
5. TanStack Query のフックが必要なら src/hooks/ に作成

## ルール
- TypeScript 厳密モード（any禁止）
- Server Component をデフォルト、必要な場合のみ 'use client'
- Tailwind CSS でスタイリング
- shadcn/ui を最大限活用
- レスポンシブ対応（モバイルファースト）
- アクセシビリティ（ARIA属性、キーボード操作）
- ローディング状態・エラー状態のハンドリング
