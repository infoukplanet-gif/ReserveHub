# DB詳細仕様書

## 技術選定

- **DB**: PostgreSQL（Supabase）
- **ORM**: Prisma
- **認証**: Supabase Auth

## ER図（概要）

```
Tenant ─┬── Staff
        ├── Menu ──── PricingRule
        │         └── MenuOption
        ├── Customer ─── CustomerTag
        │            ├── CarteRecord
        │            └── PurchasedTicket
        ├── Reservation ── ReservationOption
        │              └── ReservationTicketUsage
        ├── TicketTemplate
        ├── CarteTemplate ── CarteField
        ├── BusinessHour
        ├── SpecialDate
        ├── HpSetting
        ├── HpPage
        └── BlogPost
```

---

## テーブル定義

### tenants（テナント/事業者）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name | varchar(100) | NOT NULL | 事業者名/店舗名 |
| slug | varchar(50) | UNIQUE, NOT NULL | URL用スラッグ（例: my-salon） |
| email | varchar(255) | NOT NULL | 連絡先メール |
| phone | varchar(20) | | 電話番号 |
| postal_code | varchar(10) | | 郵便番号 |
| address | text | | 住所 |
| latitude | decimal(10,7) | | 緯度 |
| longitude | decimal(10,7) | | 経度 |
| logo_url | text | | ロゴ画像URL |
| description | text | | 事業者説明 |
| plan | varchar(20) | DEFAULT 'free' | free/standard/pro/enterprise |
| plan_expires_at | timestamptz | | プラン有効期限 |
| timezone | varchar(50) | DEFAULT 'Asia/Tokyo' | |
| booking_buffer_minutes | int | DEFAULT 0 | 予約間のバッファ時間 |
| cancel_deadline_hours | int | DEFAULT 24 | キャンセル締切（時間前） |
| booking_deadline_hours | int | DEFAULT 1 | 予約締切（時間前） |
| max_future_days | int | DEFAULT 60 | 何日先まで予約可能 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**インデックス**: `slug` (UNIQUE)

---

### staff（スタッフ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| user_id | uuid | FK(auth.users) | Supabase Auth ユーザー |
| name | varchar(100) | NOT NULL | 表示名 |
| email | varchar(255) | | |
| phone | varchar(20) | | |
| role | varchar(20) | DEFAULT 'staff' | owner/admin/staff |
| avatar_url | text | | プロフィール画像 |
| bio | text | | 自己紹介 |
| nomination_fee | int | DEFAULT 0 | 指名料（円） |
| is_active | boolean | DEFAULT true | |
| display_order | int | DEFAULT 0 | 表示順 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**インデックス**: `tenant_id`, `user_id`

---

### menu_categories（メニューカテゴリ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| name | varchar(100) | NOT NULL | カテゴリ名 |
| display_order | int | DEFAULT 0 | |
| created_at | timestamptz | DEFAULT now() | |

---

### menus（メニュー）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| category_id | uuid | FK(menu_categories) | |
| name | varchar(200) | NOT NULL | メニュー名 |
| description | text | | 説明文 |
| duration_minutes | int | NOT NULL | 所要時間（分） |
| buffer_minutes | int | DEFAULT 0 | 前後のバッファ時間 |
| base_price | int | NOT NULL | ベース料金（円） |
| image_url | text | | メニュー画像 |
| is_active | boolean | DEFAULT true | |
| display_order | int | DEFAULT 0 | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**インデックス**: `tenant_id`, `category_id`

---

### pricing_rules（料金ルール）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| menu_id | uuid | FK(menus), NOT NULL | |
| rule_type | varchar(20) | NOT NULL | day_of_week / time_slot / day_and_time |
| day_of_week | int[] | | 曜日配列 [0=日, 1=月, ..., 6=土] |
| time_from | time | | 開始時刻 |
| time_to | time | | 終了時刻 |
| price | int | NOT NULL | この条件での料金（円） |
| label | varchar(50) | | 表示ラベル（例:「平日料金」） |
| priority | int | DEFAULT 0 | 優先順位（高い方が優先） |
| created_at | timestamptz | DEFAULT now() | |

**料金計算ロジック**:
```sql
-- 該当する料金ルールの中で最もpriorityが高いものを適用
-- ルールが一致しない場合はmenus.base_priceを使用
SELECT price FROM pricing_rules
WHERE menu_id = ?
  AND (day_of_week IS NULL OR ? = ANY(day_of_week))
  AND (time_from IS NULL OR ? >= time_from)
  AND (time_to IS NULL OR ? < time_to)
ORDER BY priority DESC
LIMIT 1;
```

**インデックス**: `menu_id`

---

### menu_options（メニューオプション）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| menu_id | uuid | FK(menus), NOT NULL | |
| name | varchar(200) | NOT NULL | オプション名 |
| price | int | NOT NULL | 追加料金（円） |
| duration_minutes | int | DEFAULT 0 | 追加時間（分） |
| is_required | boolean | DEFAULT false | 必須選択か |
| max_selections | int | DEFAULT 1 | 最大選択数（0=無制限） |
| display_order | int | DEFAULT 0 | |
| is_active | boolean | DEFAULT true | |
| created_at | timestamptz | DEFAULT now() | |

**インデックス**: `menu_id`

---

### staff_menus（スタッフ×メニュー対応表）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| staff_id | uuid | FK(staff), NOT NULL | |
| menu_id | uuid | FK(menus), NOT NULL | |

**PK**: (staff_id, menu_id)

---

### customers（顧客）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| user_id | uuid | FK(auth.users) | ログインユーザーと紐付け（任意） |
| name | varchar(100) | NOT NULL | 氏名 |
| name_kana | varchar(100) | | フリガナ |
| email | varchar(255) | | |
| phone | varchar(20) | | |
| birth_date | date | | 生年月日 |
| gender | varchar(10) | | male/female/other/unspecified |
| memo | text | | 事業者メモ |
| total_visits | int | DEFAULT 0 | 累計来店回数 |
| total_revenue | int | DEFAULT 0 | 累計売上（円） |
| last_visit_at | timestamptz | | 最終来店日 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**インデックス**: `tenant_id`, `email`, `phone`, `user_id`

---

### customer_tags（顧客タグ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| name | varchar(50) | NOT NULL | タグ名 |
| color | varchar(7) | DEFAULT '#3B82F6' | タグ色 |

---

### customer_tag_assignments（顧客×タグ紐付け）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| customer_id | uuid | FK(customers), NOT NULL | |
| tag_id | uuid | FK(customer_tags), NOT NULL | |

**PK**: (customer_id, tag_id)

---

### carte_templates（カルテテンプレート）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| name | varchar(100) | NOT NULL | テンプレート名 |
| created_at | timestamptz | DEFAULT now() | |

---

### carte_fields（カルテ項目定義）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| template_id | uuid | FK(carte_templates), NOT NULL | |
| name | varchar(100) | NOT NULL | 項目名 |
| field_type | varchar(20) | NOT NULL | text/number/select/multi_select/image/date |
| options | jsonb | | 選択肢（select/multi_select用） |
| is_required | boolean | DEFAULT false | |
| display_order | int | DEFAULT 0 | |

---

### carte_records（カルテ記録）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| customer_id | uuid | FK(customers), NOT NULL | |
| reservation_id | uuid | FK(reservations) | 予約に紐付け（任意） |
| template_id | uuid | FK(carte_templates), NOT NULL | |
| staff_id | uuid | FK(staff) | 記録者 |
| data | jsonb | NOT NULL | カルテデータ {field_id: value, ...} |
| memo | text | | 自由記述メモ |
| recorded_at | timestamptz | DEFAULT now() | |
| created_at | timestamptz | DEFAULT now() | |

**インデックス**: `customer_id`, `reservation_id`

---

### ticket_templates（回数券テンプレート）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| name | varchar(200) | NOT NULL | 回数券名 |
| total_count | int | NOT NULL | 回数 |
| price | int | NOT NULL | 販売価格（円） |
| valid_months | int | NOT NULL | 有効期間（月） |
| is_on_sale | boolean | DEFAULT true | 販売中か |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

---

### ticket_template_menus（回数券×対象メニュー）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| ticket_template_id | uuid | FK(ticket_templates), NOT NULL | |
| menu_id | uuid | FK(menus), NOT NULL | |

**PK**: (ticket_template_id, menu_id)

---

### purchased_tickets（購入済み回数券）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| customer_id | uuid | FK(customers), NOT NULL | |
| ticket_template_id | uuid | FK(ticket_templates), NOT NULL | |
| remaining_count | int | NOT NULL | 残回数 |
| purchased_at | timestamptz | DEFAULT now() | 購入日 |
| expires_at | timestamptz | NOT NULL | 有効期限 |
| status | varchar(20) | DEFAULT 'active' | active/expired/used_up |
| created_at | timestamptz | DEFAULT now() | |

**インデックス**: `customer_id`, `tenant_id`, `status`

---

### reservations（予約）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| customer_id | uuid | FK(customers), NOT NULL | |
| staff_id | uuid | FK(staff) | 担当スタッフ |
| menu_id | uuid | FK(menus), NOT NULL | |
| starts_at | timestamptz | NOT NULL | 開始日時 |
| ends_at | timestamptz | NOT NULL | 終了日時 |
| menu_price | int | NOT NULL | メニュー料金（予約時点の確定額） |
| option_price | int | DEFAULT 0 | オプション料金合計 |
| nomination_fee | int | DEFAULT 0 | 指名料 |
| total_price | int | NOT NULL | 合計金額 |
| status | varchar(20) | DEFAULT 'confirmed' | confirmed/completed/cancelled/no_show |
| cancel_reason | text | | キャンセル理由 |
| memo | text | | スタッフメモ |
| source | varchar(20) | DEFAULT 'web' | web/manual/line |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**インデックス**: `tenant_id + starts_at`, `customer_id`, `staff_id + starts_at`, `status`

---

### reservation_options（予約×選択オプション）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| reservation_id | uuid | FK(reservations), NOT NULL | |
| menu_option_id | uuid | FK(menu_options), NOT NULL | |
| price | int | NOT NULL | 予約時点のオプション料金 |

---

### reservation_ticket_usages（予約×回数券消化）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| reservation_id | uuid | FK(reservations), NOT NULL | |
| purchased_ticket_id | uuid | FK(purchased_tickets), NOT NULL | |
| used_at | timestamptz | DEFAULT now() | |

---

### business_hours（営業時間）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| day_of_week | int | NOT NULL | 0=日, 1=月, ..., 6=土 |
| open_time | time | NOT NULL | 開始時刻 |
| close_time | time | NOT NULL | 終了時刻 |
| is_closed | boolean | DEFAULT false | 定休日 |

**UNIQUE**: (tenant_id, day_of_week)

---

### special_dates（特別日設定）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| date | date | NOT NULL | 日付 |
| is_closed | boolean | DEFAULT true | 休業日か |
| open_time | time | | 特別営業開始 |
| close_time | time | | 特別営業終了 |
| label | varchar(100) | | ラベル（例: GW休業） |

**UNIQUE**: (tenant_id, date)

---

### hp_settings（ホームページ設定）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), UNIQUE, NOT NULL | |
| template | varchar(50) | DEFAULT 'simple' | テンプレート名 |
| primary_color | varchar(7) | DEFAULT '#3B82F6' | メインカラー |
| secondary_color | varchar(7) | DEFAULT '#1E40AF' | サブカラー |
| hero_image_url | text | | ヒーロー画像 |
| hero_title | varchar(200) | | キャッチコピー |
| hero_subtitle | text | | サブキャッチ |
| custom_domain | varchar(255) | | 独自ドメイン |
| meta_title | varchar(100) | | SEO title |
| meta_description | varchar(300) | | SEO description |
| og_image_url | text | | OGP画像 |
| ga_tracking_id | varchar(20) | | Google Analytics ID |
| custom_css | text | | カスタムCSS |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

---

### hp_pages（固定ページ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| slug | varchar(50) | NOT NULL | ページスラッグ |
| title | varchar(200) | NOT NULL | ページタイトル |
| content | jsonb | NOT NULL | ブロックエディタJSON |
| is_published | boolean | DEFAULT true | |
| display_order | int | DEFAULT 0 | |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**UNIQUE**: (tenant_id, slug)

---

### blog_posts（ブログ/お知らせ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| title | varchar(200) | NOT NULL | |
| slug | varchar(200) | NOT NULL | |
| content | text | NOT NULL | Markdown or HTML |
| thumbnail_url | text | | サムネイル |
| category | varchar(50) | | カテゴリ |
| is_published | boolean | DEFAULT false | |
| published_at | timestamptz | | 公開日時 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**UNIQUE**: (tenant_id, slug)
**インデックス**: `tenant_id + is_published + published_at`

---

### notification_logs（通知ログ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK(tenants), NOT NULL | |
| customer_id | uuid | FK(customers) | |
| reservation_id | uuid | FK(reservations) | |
| type | varchar(30) | NOT NULL | confirmation/reminder/cancellation/ticket_expiry |
| channel | varchar(20) | NOT NULL | email/line |
| status | varchar(20) | DEFAULT 'sent' | sent/failed/bounced |
| sent_at | timestamptz | DEFAULT now() | |

---

## RLS（Row Level Security）ポリシー

全テーブルにRLSを適用し、テナント単位でデータを分離:

```sql
-- 基本ポリシー: 自テナントのデータのみアクセス可
CREATE POLICY tenant_isolation ON {table}
  USING (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id');
```

顧客向けテーブル（予約等）は別途ポリシーを追加:
```sql
-- 顧客は自分の予約のみ参照可
CREATE POLICY customer_own_reservations ON reservations
  FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  ));
```
