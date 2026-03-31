---
name: commit-smart
description: 変更内容を分析してセマンティックなConventional Commitを作成する。コミット時に使う。
user-invocable: true
allowed-tools: Read, Bash, Grep, Glob
---

# Smart Commit

## ワークフロー

### Step 1: 状態確認
```bash
git status
git diff --stat
git diff --cached --stat
```

### Step 2: ステージング
未ステージなら論理的なグループで提案し、ユーザーに確認後ステージング。

### Step 3: diff分析
```bash
git diff --cached
```

コミットタイプを判定:

| シグナル | タイプ |
|---|---|
| 新ファイル+新機能 | `feat` |
| テスト追加 | `test` |
| バグ修正 | `fix` |
| 構造変更（挙動変更なし） | `refactor` |
| 設定ファイル変更 | `chore` |
| ドキュメントのみ | `docs` |
| パフォーマンス改善 | `perf` |

スコープは主要ディレクトリから自動判定（api, booking, dashboard等）。

### Step 4: コミットメッセージ作成

```
type(scope): 命令形の短い説明（max 72文字）

WHYを説明する本文（変更が自明なら省略）
```

### Step 5: 確認してコミット
ユーザーに提示 → 承認 → `git commit` → `git log --oneline -1`で確認。
