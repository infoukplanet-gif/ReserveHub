# Pre-commit Hook 設定ガイド

プロジェクト初期化時に以下を設定すること。

## lint-staged + husky

```bash
pnpm add -D husky lint-staged
npx husky init
```

## .husky/pre-commit

```bash
pnpm lint-staged
```

## package.json に追加

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/ --ext .ts,.tsx",
    "format": "prettier --write src/",
    "prepare": "husky"
  }
}
```

## 目的
- コミット前に lint + format を自動実行
- 型チェックはCI/CDで実行（pre-commitだと遅い）
- チーム全員（= 自分）が同じ品質を維持
