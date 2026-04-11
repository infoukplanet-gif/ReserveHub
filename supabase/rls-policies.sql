-- ============================================
-- ReserveHub RLS (Row Level Security) ポリシー
-- ============================================
-- Supabase SQL Editorで実行してください
-- 注意: Prisma経由（service_role key）はRLSをバイパスします。
-- これらはSupabase Client（anon key）からの直接アクセス用です。

-- ============================================
-- ヘルパー関数: 現在のユーザーのテナントIDを取得
-- ============================================
CREATE OR REPLACE FUNCTION get_tenant_id_for_user()
RETURNS UUID AS $$
  SELECT tenant_id FROM staff WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- RLSを有効化（全テーブル）
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
ALTER TABLE follow_up_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE paid_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 公開読み取りポリシー（HP公開ページ・プラットフォーム用）
-- ============================================

CREATE POLICY "Public read tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Public read active menus" ON menus FOR SELECT USING (is_active = true);
CREATE POLICY "Public read menu categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Public read pricing rules" ON pricing_rules FOR SELECT USING (true);
CREATE POLICY "Public read active menu options" ON menu_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active staff" ON staff FOR SELECT USING (is_active = true);
CREATE POLICY "Public read staff menus" ON staff_menus FOR SELECT USING (true);
CREATE POLICY "Public read business hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "Public read special dates" ON special_dates FOR SELECT USING (true);
CREATE POLICY "Public read HP settings" ON hp_settings FOR SELECT USING (true);
CREATE POLICY "Public read HP pages" ON hp_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published blogs" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read ticket templates" ON ticket_templates FOR SELECT USING (is_on_sale = true);
CREATE POLICY "Public read published reviews" ON reviews FOR SELECT USING (is_published = true);
CREATE POLICY "Public read active paid listings" ON paid_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active boosts" ON platform_boosts FOR SELECT USING (is_active = true);

-- 予約は認証済みユーザーが作成可能（HP予約フロー）
CREATE POLICY "Auth insert reservations" ON reservations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- テナントオーナー CRUD ポリシー
-- tenant_id = get_tenant_id_for_user() で分離
-- ============================================

-- tenants
CREATE POLICY "Owner manage own tenant" ON tenants FOR ALL
  USING (id = get_tenant_id_for_user()) WITH CHECK (id = get_tenant_id_for_user());

-- staff
CREATE POLICY "Owner manage staff" ON staff FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- menu_categories
CREATE POLICY "Owner manage categories" ON menu_categories FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- menus
CREATE POLICY "Owner manage menus" ON menus FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- pricing_rules (through menu)
CREATE POLICY "Owner manage pricing rules" ON pricing_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM menus WHERE menus.id = pricing_rules.menu_id AND menus.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM menus WHERE menus.id = pricing_rules.menu_id AND menus.tenant_id = get_tenant_id_for_user()));

-- menu_options (through menu)
CREATE POLICY "Owner manage menu options" ON menu_options FOR ALL
  USING (EXISTS (SELECT 1 FROM menus WHERE menus.id = menu_options.menu_id AND menus.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM menus WHERE menus.id = menu_options.menu_id AND menus.tenant_id = get_tenant_id_for_user()));

-- staff_menus (through staff)
CREATE POLICY "Owner manage staff menus" ON staff_menus FOR ALL
  USING (EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_menus.staff_id AND staff.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_menus.staff_id AND staff.tenant_id = get_tenant_id_for_user()));

-- customers
CREATE POLICY "Owner manage customers" ON customers FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- customer_tags
CREATE POLICY "Owner manage tags" ON customer_tags FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- customer_tag_assignments (through customer)
CREATE POLICY "Owner manage tag assignments" ON customer_tag_assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE customers.id = customer_tag_assignments.customer_id AND customers.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE customers.id = customer_tag_assignments.customer_id AND customers.tenant_id = get_tenant_id_for_user()));

-- carte_templates
CREATE POLICY "Owner manage carte templates" ON carte_templates FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- carte_fields (through template)
CREATE POLICY "Owner manage carte fields" ON carte_fields FOR ALL
  USING (EXISTS (SELECT 1 FROM carte_templates WHERE carte_templates.id = carte_fields.template_id AND carte_templates.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM carte_templates WHERE carte_templates.id = carte_fields.template_id AND carte_templates.tenant_id = get_tenant_id_for_user()));

-- carte_records (through customer)
CREATE POLICY "Owner manage carte records" ON carte_records FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE customers.id = carte_records.customer_id AND customers.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE customers.id = carte_records.customer_id AND customers.tenant_id = get_tenant_id_for_user()));

-- ticket_templates
CREATE POLICY "Owner manage ticket templates" ON ticket_templates FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- ticket_template_menus (through ticket_template)
CREATE POLICY "Owner manage ticket template menus" ON ticket_template_menus FOR ALL
  USING (EXISTS (SELECT 1 FROM ticket_templates WHERE ticket_templates.id = ticket_template_menus.ticket_template_id AND ticket_templates.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM ticket_templates WHERE ticket_templates.id = ticket_template_menus.ticket_template_id AND ticket_templates.tenant_id = get_tenant_id_for_user()));

-- purchased_tickets
CREATE POLICY "Owner manage purchased tickets" ON purchased_tickets FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- reservations
CREATE POLICY "Owner manage reservations" ON reservations FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- reservation_options (through reservation)
CREATE POLICY "Owner manage reservation options" ON reservation_options FOR ALL
  USING (EXISTS (SELECT 1 FROM reservations WHERE reservations.id = reservation_options.reservation_id AND reservations.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM reservations WHERE reservations.id = reservation_options.reservation_id AND reservations.tenant_id = get_tenant_id_for_user()));

-- reservation_ticket_usages (through reservation)
CREATE POLICY "Owner manage ticket usages" ON reservation_ticket_usages FOR ALL
  USING (EXISTS (SELECT 1 FROM reservations WHERE reservations.id = reservation_ticket_usages.reservation_id AND reservations.tenant_id = get_tenant_id_for_user()))
  WITH CHECK (EXISTS (SELECT 1 FROM reservations WHERE reservations.id = reservation_ticket_usages.reservation_id AND reservations.tenant_id = get_tenant_id_for_user()));

-- business_hours
CREATE POLICY "Owner manage business hours" ON business_hours FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- special_dates
CREATE POLICY "Owner manage special dates" ON special_dates FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- hp_settings
CREATE POLICY "Owner manage HP settings" ON hp_settings FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- hp_pages
CREATE POLICY "Owner manage HP pages" ON hp_pages FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- blog_posts
CREATE POLICY "Owner manage blog posts" ON blog_posts FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- notification_logs
CREATE POLICY "Owner read notifications" ON notification_logs FOR SELECT
  USING (tenant_id = get_tenant_id_for_user());

-- follow_up_rules
CREATE POLICY "Owner manage follow up rules" ON follow_up_rules FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- follow_up_logs (through rule)
CREATE POLICY "Owner read follow up logs" ON follow_up_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM follow_up_rules WHERE follow_up_rules.id = follow_up_logs.rule_id AND follow_up_rules.tenant_id = get_tenant_id_for_user()));

-- line_configs
CREATE POLICY "Owner manage line config" ON line_configs FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- chat_messages
CREATE POLICY "Owner manage chat" ON chat_messages FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- reviews (tenant can manage their reviews)
CREATE POLICY "Owner manage reviews" ON reviews FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- service_requests
CREATE POLICY "Owner manage service requests" ON service_requests FOR ALL
  USING (tenant_id = get_tenant_id_for_user()) WITH CHECK (tenant_id = get_tenant_id_for_user());

-- ============================================
-- プラットフォームユーザー（患者側）ポリシー
-- ============================================

-- platform_users: 自分のデータのみ
CREATE POLICY "Platform user read own" ON platform_users FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Platform user update own" ON platform_users FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Platform user insert" ON platform_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- platform_favorites: 自分のお気に入り
CREATE POLICY "Platform user manage favorites" ON platform_favorites FOR ALL
  USING (EXISTS (SELECT 1 FROM platform_users WHERE platform_users.id = platform_favorites.platform_user_id AND platform_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_users WHERE platform_users.id = platform_favorites.platform_user_id AND platform_users.user_id = auth.uid()));

-- platform_disclosures: 自分の開示設定
CREATE POLICY "Platform user manage disclosures" ON platform_disclosures FOR ALL
  USING (EXISTS (SELECT 1 FROM platform_users WHERE platform_users.id = platform_disclosures.platform_user_id AND platform_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_users WHERE platform_users.id = platform_disclosures.platform_user_id AND platform_users.user_id = auth.uid()));

-- reviews: 認証済みユーザーが口コミ投稿
CREATE POLICY "Auth user insert review" ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- Supabase Storage: uploads バケット
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage ポリシー: 認証済みユーザーがアップロード/更新/削除可能
CREATE POLICY "Auth users upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users update own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users delete own" ON storage.objects FOR DELETE
  USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Public read uploads" ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');
