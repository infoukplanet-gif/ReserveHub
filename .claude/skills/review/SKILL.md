---
name: review
description: 最新の変更をレビューする。コード品質・セキュリティ・仕様準拠を確認。
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
context: fork
agent: reviewer
---

最新のgit diffを確認し、以下の観点でレビューしてください。

!`git diff --stat HEAD~1`

## レビュー観点
1. **セキュリティ**: テナント分離、認証、入力バリデーション
2. **仕様準拠**: docs/ の仕様書と一致しているか
3. **コード品質**: 型安全、エラーハンドリング、パフォーマンス
4. **料金計算**: ルールの優先順位が正しいか
5. **回数券**: 消化ロジックが正しいか

変更されたファイルをすべて読み、問題があれば具体的な修正案と共に報告してください。
