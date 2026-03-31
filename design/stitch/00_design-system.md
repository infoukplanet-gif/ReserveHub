# ReserveHub Design System v1.0

全画面・全コンポーネントに適用する唯一のルールブック。
「おしゃれ」「便利」「使いやすい」は禁止。全てこの仕様書の数値で判断する。

---

## 1. カラートークン

### 用途定義（色を選ぶ判断基準）

| トークン名 | 値 | 使う場面 | 使わない場面 |
|---|---|---|---|
| `primary` | #2563EB | ユーザーが次に押すべきボタン。1画面に1つだけ | 装飾、背景 |
| `primary-hover` | #1D4ED8 | primary のhover/active | |
| `primary-subtle` | #EFF6FF | 選択中のカード背景、アクティブタブ背景 | ボタン背景 |
| `secondary` | #7C3AED | 回数券、クーポン、特別な要素のみ | 一般的なボタン |
| `success` | #16A34A | 完了・確定・有効の状態表示のみ | ボタン |
| `warning` | #F59E0B | 期限間近・注意の状態表示のみ | ボタン |
| `danger` | #DC2626 | 削除ボタン、エラー、キャンセル状態のみ | 強調したいだけの場面 |
| `bg` | #F8FAFC | ページ全体の背景 | カード内 |
| `surface` | #FFFFFF | カード、Sheet、Modal内部 | ページ背景 |
| `border` | #E2E8F0 | カード、Input、Tableの境界線 | テキスト |
| `text` | #0F172A | 見出し、本文、金額 | プレースホルダー |
| `text-muted` | #64748B | 補足テキスト、プレースホルダー、タイムスタンプ | 見出し、金額 |
| `text-subtle` | #94A3B8 | 無効状態、キャプション | 本文 |

### ルール
- **1画面にprimaryボタンは最大1つ。** 複数アクションがある場合、最重要のみprimary、残りはoutline or ghost。
- **色で意味を伝える場合、必ずテキストかアイコンを併用する。** 色覚多様性対応。
- **ステータスバッジの色は固定。** confirmed=primary, completed=success, cancelled=danger, no_show=text-muted, active=success, expired=danger, warning=warning。変えない。

---

## 2. タイポグラフィスケール

### フォント
```
--font-sans: 'Inter', 'Noto Sans JP', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;  /* コード表示のみ */
```

### スケール（1.25倍比 = Major Third）

| トークン | サイズ | ウェイト | 行間 | 用途 |
|---|---|---|---|---|
| `display` | 36px | 700 | 1.2 | HPヒーローのキャッチコピーのみ |
| `h1` | 28px | 700 | 1.3 | ページタイトル。1ページに1つ |
| `h2` | 22px | 600 | 1.3 | セクション見出し |
| `h3` | 18px | 600 | 1.4 | カード見出し、リスト項目名 |
| `body` | 15px | 400 | 1.6 | 本文、説明文 |
| `body-sm` | 13px | 400 | 1.5 | テーブルセル、フォームラベル |
| `caption` | 11px | 400 | 1.4 | タイムスタンプ、注釈 |
| `price-lg` | 28px | 700 | 1.2 | 合計金額のみ |
| `price-md` | 18px | 600 | 1.3 | メニュー料金 |
| `price-sm` | 14px | 500 | 1.4 | オプション料金、内訳 |

### ルール
- **h1は1ページに1つ。** 例外なし。
- **金額は必ずprice-*トークンを使う。** bodyで金額を表示しない。
- **日本語の長文はbody（15px）以下にしない。** 13px以下は英数字・短いラベルのみ。

---

## 3. スペーシングシステム

### 基本単位: 4px

| トークン | 値 | 用途 |
|---|---|---|
| `space-1` | 4px | アイコンとテキストの間 |
| `space-2` | 8px | Badge内のパディング、密接な要素間 |
| `space-3` | 12px | フォーム項目間、リスト項目間 |
| `space-4` | 16px | カード内パディング（モバイル）、関連する要素グループ間 |
| `space-6` | 24px | カード内パディング（デスクトップ）、セクション内の要素間 |
| `space-8` | 32px | セクション間 |
| `space-12` | 48px | ページセクション間（大きな区切り） |
| `space-16` | 64px | HPのセクション間 |

### ルール
- **同じ階層の要素は同じ間隔。** カード内の項目が12pxなら、全項目12px。混ぜない。
- **親子関係は間隔で表現する。** 近い=関連が強い、遠い=区切り。
- **ページ左右余白:** モバイル16px、タブレット24px、デスクトップ32px。

---

## 4. コンポーネント仕様

### 4.1 ボタン

| バリアント | 背景 | テキスト | ボーダー | 使用条件 |
|---|---|---|---|---|
| `primary` | primary | white | なし | 画面の主アクション。1画面に1つ |
| `outline` | transparent | primary | primary | 副アクション（キャンセル、戻る等） |
| `ghost` | transparent | text-muted | なし | 最低優先アクション（削除、リンク的操作） |
| `danger` | danger | white | なし | 削除・キャンセルの確定のみ |

サイズ:
| サイズ | 高さ | パディング | フォント | 用途 |
|---|---|---|---|---|
| `sm` | 32px | 12px 16px | 13px | テーブル内、インライン |
| `md` | 40px | 12px 20px | 15px | 通常のフォーム、カード内 |
| `lg` | 48px | 16px 24px | 16px | ページの主CTA、予約確定 |

角丸: 全サイズ8px。例外なし。

### 4.2 インプット

```
高さ: 40px
パディング: 12px 16px
フォント: 15px
ボーダー: 1px solid border (#E2E8F0)
角丸: 8px
フォーカス: border 2px solid primary、shadow-ringつき
エラー: border danger、下にエラーメッセージ（danger色、13px）
disabled: bg #F1F5F9、text-subtle
```

### 4.3 カード

```
背景: surface (#FFFFFF)
ボーダー: 1px solid border (#E2E8F0)
角丸: 12px
パディング: space-6 (24px)
シャドウ: 0 1px 2px rgba(0,0,0,0.05)
```

選択可能なカード（メニュー選択等）:
```
未選択: 上記デフォルト
hover: border #CBD5E1, shadow 0 4px 6px rgba(0,0,0,0.07)
選択中: border primary, bg primary-subtle (#EFF6FF)
```

### 4.4 Badge（ステータス表示）

```
パディング: 2px 10px
フォント: 12px / 500
角丸: 9999px
```

| ステータス | 背景 | テキスト |
|---|---|---|
| confirmed (確定) | #DBEAFE | #1D4ED8 |
| completed (完了) | #DCFCE7 | #15803D |
| cancelled (キャンセル) | #FEE2E2 | #DC2626 |
| no_show | #F1F5F9 | #64748B |
| active (有効) | #DCFCE7 | #15803D |
| expired (期限切れ) | #FEE2E2 | #DC2626 |
| warning (注意) | #FEF3C7 | #B45309 |
| draft (下書き) | #F1F5F9 | #64748B |
| published (公開中) | #DCFCE7 | #15803D |

### 4.5 テーブル

```
ヘッダー: bg #F8FAFC, text-muted, 13px/600, 上下padding 12px
セル: 15px/400, 上下padding 12px, border-bottom 1px
hover行: bg #F8FAFC
アクティブ行: bg primary-subtle
```

### 4.6 サイドバー（管理画面）

```
幅: 240px（デスクトップ）、フル幅Sheet（モバイル）
背景: surface
ボーダー: 右に1px border
項目: 高さ40px、padding 8px 16px、角丸8px
アクティブ項目: bg primary-subtle、text primary、font-weight 600
hover項目: bg #F8FAFC
アイコン: 20px、text-muted（アクティブ時はprimary）
```

### 4.7 Sheet（右からスライド）

```
幅: 480px（デスクトップ）、90vw（モバイル）
背景: surface
シャドウ: -8px 0 32px rgba(0,0,0,0.1)
オーバーレイ: rgba(0,0,0,0.4)
```

### 4.8 Dialog（中央モーダル）

```
幅: 最大480px
背景: surface
角丸: 16px
シャドウ: 0 24px 48px rgba(0,0,0,0.15)
オーバーレイ: rgba(0,0,0,0.4)
```

### 4.9 Toast

```
位置: 右上、上から16px、右から16px
幅: 360px
背景: surface
ボーダー: 1px border
角丸: 12px
シャドウ: 0 8px 24px rgba(0,0,0,0.12)
左ボーダー: 4px（success=green, danger=red, info=primary）
自動消去: 5秒
```

---

## 5. アニメーション仕様

### タイミング関数（3種類のみ。増やさない）

| 名前 | 値 | 用途 |
|---|---|---|
| `ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | 通常のUI遷移全般 |
| `ease-enter` | cubic-bezier(0, 0, 0.2, 1) | 要素の出現（Sheet、Toast、Modal） |
| `ease-exit` | cubic-bezier(0.4, 0, 1, 1) | 要素の消失 |

### デュレーション（4段階のみ。増やさない）

| 名前 | 値 | 用途 |
|---|---|---|
| `instant` | 100ms | hover色変化、ボタンpress |
| `fast` | 200ms | Sheet開閉、タブ切替、カード選択 |
| `normal` | 300ms | Toast出現、ステッパー進行 |
| `slow` | 600ms | 数値カウントアップ |

### 全インタラクション定義

| 要素 | トリガー | アニメーション | duration | easing |
|---|---|---|---|---|
| ボタン | hover | background-colorが`primary-hover`へ | instant | ease-default |
| ボタン | press | scale(0.98) | instant | ease-default |
| ボタン | loading | テキスト→スピナー+「処理中...」 | fast | ease-default |
| カード | hover | translateY(-2px), shadow-md | fast | ease-default |
| 選択カード | select | border→primary, bg→primary-subtle | fast | ease-default |
| Sheet | open | translateX(100%)→0 + overlay fade-in | fast | ease-enter |
| Sheet | close | translateX(0)→100% + overlay fade-out | fast | ease-exit |
| Dialog | open | scale(0.95)→1 + opacity 0→1 + overlay | fast | ease-enter |
| Toast | enter | translateX(100%)→0 + opacity 0→1 | normal | ease-enter |
| Toast | exit | opacity 1→0 | fast | ease-exit |
| ステッパー | advance | 現ステップ→check(scale 0→1), 次ステップ→primary色, 線がfill(left→right) | normal | ease-default |
| 料金数値 | change | 旧値fade-out→新値fade-in, 変更行にprimary背景flash(opacity 0.1→0) | normal | ease-default |
| 統計数値 | mount | 0→実値へのカウントアップ | slow | ease-default |
| スケルトン | loading | shimmer（明度の波が左→右に移動） | 1500ms loop | linear |
| タブ | switch | コンテンツfade(opacity 0→1) | instant | ease-default |
| Tooltip | enter | opacity 0→1 + translateY(4px)→0 | instant | ease-enter |

### ルール
- **アニメーションの目的は「状態変化の通知」のみ。** 装飾目的のアニメーションは入れない。
- **ユーザーの操作をブロックするアニメーションは禁止。** アニメーション中もクリック可能。
- **prefers-reduced-motion を尊重する。** reduced-motion時は全アニメーションをduration: 0にする。

---

## 6. レイアウトグリッド

### ブレークポイント（3段階のみ）

| 名前 | 幅 | カラム | ガター | ページ余白 |
|---|---|---|---|---|
| `mobile` | <768px | 4 | 16px | 16px |
| `tablet` | 768-1023px | 8 | 16px | 24px |
| `desktop` | ≥1024px | 12 | 24px | 32px |

### 管理画面レイアウト
```
desktop: [Sidebar 240px] + [Main fluid]
tablet:  [Sidebar 折りたたみ 64px] + [Main fluid]
mobile:  [Sidebar なし（Sheet）] + [Main 100%]
```

### 最大幅
- 管理画面メインコンテンツ: 1200px
- HP（顧客向け）: 1080px
- 認証画面カード: 400px
- フォーム: 600px

---

## 7. アイコンシステム

### ライブラリ: Lucide Icons（shadcn/uiデフォルト）

サイズ:
| 場所 | サイズ | strokeWidth |
|---|---|---|
| サイドバーメニュー | 20px | 1.5 |
| ボタン内 | 16px | 2 |
| 統計カード | 24px | 1.5 |
| 空状態イラスト | 48px | 1 |

### ルール
- **アイコン単体で意味を伝えない。** 必ずテキストラベルを併記。例外: 閉じるボタン（×）、戻るボタン（←）のみ。
- **カスタムアイコンは作らない。** Lucideにないものはテキストで代替。

---

## 8. 禁止事項

### グラデーション — 全面禁止
- ボタン、背景、バッジ、ヒーローを含む全要素でグラデーション禁止
- ボタンはソリッドカラーのみ（primary=#2563EB、hover=#1D4ED8）
- 背景はフラットカラーのみ（bg=#F8FAFC、surface=#FFFFFF）
- Aurora UI、グラデーションBlob、メッシュグラデーション、全て禁止

### AI臭さ — 全面排除
- 汎用的なAIイラスト、ストックイラスト禁止
- 「AIが生成しました」感のあるビジュアル禁止
- 過度なアニメーション（Blob、パーティクル、3D回転）禁止
- ネオン発光、グロウエフェクト禁止
- 過剰な角丸（pill型ボタンなど）はBadge以外禁止
- 「魔法」「スマート」「次世代」系のコピー禁止

### 目指す方向
- **Notion、Linear、Stripe Dashboard のようなフラット・ソリッド・クリーン**
- 白とグレーの階調 + primaryカラーのアクセント
- 装飾ではなく構造で美しさを出す
- 写真は事業者が撮った実写のみ（HPヒーロー等）

### 認証画面の背景
- Aurora禁止。代わりに: bg=#F8FAFC（フラット）+ 左右にprimaryカラーの大きな幾何学図形（opacity 0.03〜0.05の極薄）
- または完全に白背景 + カードのみ

### Glassmorphism — 限定使用
- **予約フローのモバイル下部固定バーのみ**（スクロールコンテンツの上に乗るため視認性確保が必要）
```css
.bottom-bar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid #E2E8F0;
}
```
- それ以外のGlassmorphismは禁止。カードは全てsurface+border。

---

## 9. 空状態・エラー状態

全データ表示画面に以下の3状態を定義する:

### ローディング
- スケルトン表示（テーブル→行スケルトン、カード→カードスケルトン）
- shimmerアニメーション

### 空状態
```
[48pxアイコン（Lucide、text-subtle色）]
まだデータがありません
[説明文（text-muted、1行）]
[+ 追加するボタン（outline）]
```

### エラー状態
```
[48pxアイコン（AlertCircle、danger色）]
データの取得に失敗しました
[再試行ボタン（outline）]
```

---

## 10. 命名規則

### CSSクラス（Tailwind）
- コンポーネント固有のスタイルが必要な場合のみcn()で合成
- インラインスタイル禁止
- !important禁止

### コンポーネント命名
```
画面部品:     BookingStepIndicator, PriceBreakdown, CarteRecord
共通部品:     StatsCard, DataTable, EmptyState, ErrorState
レイアウト:    DashboardLayout, BookingLayout, HpLayout
```

---

## チェックリスト: 新画面/コンポーネント追加時

- [ ] primaryボタンは1画面に1つか
- [ ] 色は全てトークンを使っているか（ハードコード禁止）
- [ ] フォントサイズはスケール表のどれかか
- [ ] スペーシングはspace-*トークンか
- [ ] アニメーションは定義表にあるものか（新規アニメーション禁止）
- [ ] ローディング・空状態・エラー状態の3態があるか
- [ ] モバイル表示を確認したか
- [ ] アイコンにテキストラベルがあるか
