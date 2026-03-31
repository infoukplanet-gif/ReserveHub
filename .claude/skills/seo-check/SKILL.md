---
name: seo-check
description: ホームページ機能のSEO・パフォーマンス・アクセシビリティを監査する。HP機能の実装時やリリース前に使う。
argument-hint: "[URL or ページパス]"
user-invocable: true
allowed-tools: Read, Bash, Grep, Glob, WebFetch
---

# SEO・パフォーマンス監査

対象: $ARGUMENTS

## 1. メタタグチェック

- [ ] `<title>` — 30-60文字、キーワード含む
- [ ] `<meta name="description">` — 120-160文字
- [ ] `<link rel="canonical">` — 正規URL
- [ ] OGPタグ（og:title, og:description, og:image, og:url）
- [ ] Twitter Card（twitter:card, twitter:title, twitter:image）
- [ ] ファビコン

## 2. 構造化データ

事業者HPに必須:
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "店舗名",
  "address": { "@type": "PostalAddress", ... },
  "telephone": "...",
  "openingHoursSpecification": [...],
  "priceRange": "..."
}
```

- [ ] JSON-LD で LocalBusiness を出力
- [ ] Google Rich Results Test でエラーなし

## 3. パフォーマンス

```bash
# Lighthouse CLI（インストール済みの場合）
npx lighthouse $ARGUMENTS --output=json --quiet
```

目標値:
| メトリクス | 目標 |
|---|---|
| LCP | < 2.5秒 |
| FID/INP | < 100ms |
| CLS | < 0.1 |
| Performance Score | > 90 |

チェック項目:
- [ ] 画像: next/image で最適化、WebP/AVIF
- [ ] フォント: next/font で最適化、display: swap
- [ ] JS: 不要なClient Componentがないか
- [ ] CSS: Tailwind のpurgeが効いているか

## 4. アクセシビリティ

- [ ] 画像にalt属性
- [ ] フォームにlabel
- [ ] 色コントラスト比 4.5:1 以上
- [ ] キーボード操作可能
- [ ] heading の階層が正しい（h1→h2→h3）
- [ ] lang属性（html lang="ja"）

## 5. クローラビリティ

- [ ] robots.txt が正しい
- [ ] sitemap.xml が生成されている
- [ ] 内部リンクが壊れていない
- [ ] モバイルフレンドリー

## 6. 事業者HP固有

- [ ] メニュー・料金ページが検索エンジンに読まれる（SSR/SSG）
- [ ] 予約ボタンが目立つ位置にある
- [ ] Google Map の埋め込みが表示される
- [ ] お知らせ/ブログが最新記事から表示される

## 出力

```
## SEO監査結果: [URL]

### スコア
- Performance: XX/100
- SEO: XX/100
- Accessibility: XX/100

### 🔴 Critical
- ...

### 🟡 Warning
- ...

### 🟢 Good
- ...

### 推奨アクション
1. ...
2. ...
```
