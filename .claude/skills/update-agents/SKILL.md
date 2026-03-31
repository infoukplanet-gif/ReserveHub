---
name: update-agents
description: 会話で得た知見をもとにAgentsとSkillsの定義を更新する。振り返り時や新しいルール・知見が出た時に使う。
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob
---

会話から得た知見をAgentsとSkillsに反映してください。

## 手順

### 1. 変更ログを確認
docs/changelog.md を読み、前回の振り返り以降の記録を確認する。

### 2. Agents の更新対象を判定
以下のいずれかに該当する場合、該当エージェントを更新する:
- 新しい開発ルールが追加された
- バグの原因パターンが判明した（再発防止）
- レビューで見落としがあった観点
- 新しい技術・ライブラリが導入された
- 仕様変更があった

対象ファイル:
- .claude/agents/backend-dev.md
- .claude/agents/frontend-dev.md
- .claude/agents/reviewer.md
- .claude/agents/qa.md

### 3. Skills の更新対象を判定
以下のいずれかに該当する場合、該当スキルを更新する:
- テンプレート構造に改善点が見つかった
- 生成時のルールが追加された
- 新しいスキルが必要になった

対象ファイル:
- .claude/skills/*/SKILL.md

### 4. 更新を実行
- 各ファイルを読み込み、必要な箇所を更新する
- 更新理由をコメントとして changelog に追記
- 不要になったルールは削除する（肥大化防止）

### 5. 更新サマリーを出力
```
## Agent/Skill 更新サマリー
- [更新] backend-dev.md — ○○ルールを追加（理由: △△で問題が発生したため）
- [更新] reviewer.md — ○○チェック項目を追加
- [新規] skills/xxx/ — 新スキルを追加
- [削除] ○○ — 不要になったため削除
```
