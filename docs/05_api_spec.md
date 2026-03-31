# API仕様書

## 基本仕様

- **ベースURL**: `/api`
- **認証**: Supabase Auth JWT (Bearerトークン)
- **レスポンス形式**: JSON
- **エラー形式**: `{ error: string, code: string }`

---

## 予約管理 API

### GET /api/reservations
予約一覧の取得

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| from | string (ISO8601) | ○ | 開始日時 |
| to | string (ISO8601) | ○ | 終了日時 |
| staff_id | uuid | | スタッフ絞り込み |
| status | string | | confirmed/completed/cancelled/no_show |
| page | number | | ページ番号（デフォルト1） |
| per_page | number | | 件数（デフォルト50） |

**レスポンス**:
```json
{
  "data": [
    {
      "id": "uuid",
      "customer": { "id": "uuid", "name": "山田太郎", "phone": "090-xxxx" },
      "staff": { "id": "uuid", "name": "スタッフA" },
      "menu": { "id": "uuid", "name": "60分コース" },
      "options": [
        { "id": "uuid", "name": "ヘッドスパ", "price": 1000 }
      ],
      "starts_at": "2026-04-01T10:00:00+09:00",
      "ends_at": "2026-04-01T11:00:00+09:00",
      "menu_price": 8000,
      "option_price": 1000,
      "nomination_fee": 500,
      "total_price": 9500,
      "status": "confirmed",
      "ticket_used": false,
      "memo": "",
      "created_at": "2026-03-30T..."
    }
  ],
  "total": 120,
  "page": 1,
  "per_page": 50
}
```

### POST /api/reservations
予約の作成

**リクエスト**:
```json
{
  "menu_id": "uuid",
  "staff_id": "uuid | null",
  "starts_at": "2026-04-01T10:00:00+09:00",
  "option_ids": ["uuid", "uuid"],
  "customer": {
    "name": "山田太郎",
    "email": "yamada@example.com",
    "phone": "090-1234-5678"
  },
  "use_ticket_id": "uuid | null",
  "memo": ""
}
```

**処理フロー**:
1. 空き枠チェック（ダブルブッキング防止）
2. 料金計算（曜日/時間帯ルール + オプション + 指名料）
3. 顧客レコード作成 or 既存顧客の紐付け
4. 回数券消化（指定時）
5. 予約レコード作成
6. 確認メール送信
7. スタッフ通知

### PATCH /api/reservations/:id
予約の更新（日時変更、ステータス変更）

### DELETE /api/reservations/:id
予約のキャンセル

---

### GET /api/reservations/availability
空き枠の取得（顧客向け）

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| tenant_slug | string | ○ | テナントスラッグ |
| menu_id | uuid | ○ | メニューID |
| staff_id | uuid | | スタッフ指定（空=全員） |
| date | string (YYYY-MM-DD) | ○ | 日付 |
| option_ids | uuid[] | | 選択オプション（時間加算用） |

**レスポンス**:
```json
{
  "date": "2026-04-01",
  "day_of_week": 3,
  "slots": [
    {
      "starts_at": "2026-04-01T10:00:00+09:00",
      "ends_at": "2026-04-01T11:15:00+09:00",
      "price": 8000,
      "available_staff": [
        { "id": "uuid", "name": "スタッフA", "nomination_fee": 500 }
      ]
    },
    {
      "starts_at": "2026-04-01T11:30:00+09:00",
      "ends_at": "2026-04-01T12:45:00+09:00",
      "price": 8000,
      "available_staff": [...]
    }
  ]
}
```

---

## メニュー API

### GET /api/menus
### POST /api/menus
### PATCH /api/menus/:id
### DELETE /api/menus/:id

### POST /api/menus/:id/pricing-rules
料金ルールの追加

```json
{
  "rule_type": "day_and_time",
  "day_of_week": [0, 6],
  "time_from": "18:00",
  "time_to": "21:00",
  "price": 12000,
  "label": "休日ナイト料金",
  "priority": 10
}
```

### POST /api/menus/:id/options
オプションの追加

```json
{
  "name": "ヘッドスパ追加",
  "price": 1500,
  "duration_minutes": 15,
  "is_required": false,
  "max_selections": 1
}
```

---

## スタッフ API

### GET /api/staff
### POST /api/staff
### PATCH /api/staff/:id
### DELETE /api/staff/:id

---

## 顧客 API

### GET /api/customers
### GET /api/customers/:id
### PATCH /api/customers/:id

### GET /api/customers/:id/history
来店履歴

### GET /api/customers/:id/cartes
カルテ一覧

### POST /api/customers/:id/cartes
カルテ記録

```json
{
  "template_id": "uuid",
  "reservation_id": "uuid",
  "data": {
    "field_uuid_1": "肩こりがひどい",
    "field_uuid_2": ["肩", "腰"],
    "field_uuid_3": 7
  },
  "memo": "次回は腰を重点的に"
}
```

### GET /api/customers/:id/tickets
保有回数券一覧

---

## 回数券 API

### GET /api/ticket-templates
### POST /api/ticket-templates
### PATCH /api/ticket-templates/:id

### POST /api/tickets/purchase
回数券の販売（手動）

```json
{
  "customer_id": "uuid",
  "ticket_template_id": "uuid"
}
```

---

## ホームページ API

### GET /api/homepage/settings
### PATCH /api/homepage/settings

### GET /api/homepage/pages
### POST /api/homepage/pages
### PATCH /api/homepage/pages/:id

### GET /api/blog/posts
### POST /api/blog/posts
### PATCH /api/blog/posts/:id
### DELETE /api/blog/posts/:id

---

## 公開 API（認証不要、テナントslug指定）

顧客向け予約画面・HPで使用:

### GET /api/public/:slug/info
事業者情報

### GET /api/public/:slug/menus
メニュー一覧（料金含む）

### GET /api/public/:slug/staff
スタッフ一覧

### GET /api/public/:slug/availability
空き枠

### POST /api/public/:slug/book
予約作成（顧客側）

### GET /api/public/:slug/blog
ブログ一覧

---

## ダッシュボード API

### GET /api/dashboard/summary
```json
{
  "today": {
    "reservations": 8,
    "revenue": 64000
  },
  "this_week": {
    "reservations": 35,
    "revenue": 280000
  },
  "this_month": {
    "reservations": 142,
    "revenue": 1136000,
    "new_customers": 18,
    "repeat_rate": 0.72
  },
  "upcoming": [...],
  "expiring_tickets": [...]
}
```

---

## Webhook / Cron

### POST /api/webhooks/stripe
Stripe決済完了通知

### POST /api/cron/send-reminders
リマインドメール送信（Vercel Cron）

### POST /api/cron/expire-tickets
期限切れ回数券の処理（日次）
