-- ============================================
-- ReserveHub RLS (Row Level Security) ポリシー
-- ============================================
-- Supabase SQL Editorで実行してください
-- https://supabase.com/dashboard/project/nkdrxtqdnzezdxqftvgw/sql/new

-- 注意: 現在のアプリはPrisma経由（service_role key）でアクセスするため、
-- RLSはSupabase Client（anon key）からの直接アクセスに対して有効です。
-- Prisma経由のアクセスはservice_roleのため、RLSをバイパスします。

-- ============================================
-- RLSを有効化
-- ============================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE carte_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE carte_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE carte_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_template_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_ticket_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hp_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 公開読み取りポリシー（HP公開ページ用）
-- ============================================

-- テナント情報は公開（HP表示用）
CREATE POLICY "Public can read tenants" ON tenants
  FOR SELECT USING (true);

-- メニューは公開
CREATE POLICY "Public can read active menus" ON menus
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read menu categories" ON menu_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read pricing rules" ON pricing_rules
  FOR SELECT USING (true);

CREATE POLICY "Public can read active menu options" ON menu_options
  FOR SELECT USING (is_active = true);

-- スタッフは公開（プロフィール表示用）
CREATE POLICY "Public can read active staff" ON staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read staff menus" ON staff_menus
  FOR SELECT USING (true);

-- 営業時間は公開
CREATE POLICY "Public can read business hours" ON business_hours
  FOR SELECT USING (true);

CREATE POLICY "Public can read special dates" ON special_dates
  FOR SELECT USING (true);

-- HP設定は公開
CREATE POLICY "Public can read HP settings" ON hp_settings
  FOR SELECT USING (true);

-- 公開ブログは公開
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

-- ============================================
-- 認証済みユーザー（管理者）ポリシー
-- ============================================
-- service_role keyを使うPrisma経由はRLSをバイパスするため、
-- これらのポリシーはSupabase Client直接アクセス時のみ有効

-- 予約は認証済みユーザーのみ作成可能
CREATE POLICY "Authenticated can insert reservations" ON reservations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 顧客情報は認証済みのみ
CREATE POLICY "Authenticated can read customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');
