---
name: gen-migration
description: DB仕様書に基づいてPrismaマイグレーションを生成する。テーブル追加・変更時に使う。
argument-hint: "[テーブル名 or 変更内容]"
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

docs/03_db_schema.md の仕様に基づいて、「$ARGUMENTS」に関するPrismaスキーマとマイグレーションを生成してください。

## 手順
1. docs/03_db_schema.md を読み、該当テーブルの定義を確認
2. prisma/schema.prisma に model を追加/更新
3. `npx prisma migrate dev --name {migration_name}` を実行
4. 必要なRLSポリシーのSQLも supabase/migrations/ に生成

## ルール
- カラム名はスネークケース
- Prisma model名はパスカルケース
- リレーションは明示的に定義
- インデックスは仕様書に記載のものを必ず追加
- UNIQUE制約も仕様書通りに
