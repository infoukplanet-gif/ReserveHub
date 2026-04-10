-- Tenant: Stripe + Theme + Platform fields
ALTER TABLE "tenants" ADD COLUMN "stripe_customer_id" VARCHAR(255);
ALTER TABLE "tenants" ADD COLUMN "stripe_subscription_id" VARCHAR(255);
ALTER TABLE "tenants" ADD COLUMN "trial_ends_at" TIMESTAMPTZ;
ALTER TABLE "tenants" ADD COLUMN "dashboard_theme" VARCHAR(30) NOT NULL DEFAULT 'flat';
ALTER TABLE "tenants" ADD COLUMN "is_listed_on_platform" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tenants" ADD COLUMN "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE UNIQUE INDEX "tenants_stripe_customer_id_key" ON "tenants"("stripe_customer_id");

-- Customer: LINE user ID
ALTER TABLE "customers" ADD COLUMN "line_user_id" VARCHAR(100);

-- HpSetting: UI Theme
ALTER TABLE "hp_settings" ADD COLUMN "ui_theme" VARCHAR(30) NOT NULL DEFAULT 'flat';

-- FollowUpRule
CREATE TABLE "follow_up_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "trigger_type" VARCHAR(30) NOT NULL,
    "interval_days" INTEGER,
    "symptom_keyword" VARCHAR(200),
    "season_month" INTEGER,
    "season_day" INTEGER,
    "days_before_expiry" INTEGER,
    "subject" VARCHAR(200) NOT NULL,
    "body_template" TEXT NOT NULL,
    "channel" VARCHAR(20) NOT NULL DEFAULT 'email',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_preset" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_up_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "follow_up_rules_tenant_id_idx" ON "follow_up_rules"("tenant_id");
ALTER TABLE "follow_up_rules" ADD CONSTRAINT "follow_up_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FollowUpLog
CREATE TABLE "follow_up_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "channel" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_detail" TEXT,
    CONSTRAINT "follow_up_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "follow_up_logs_rule_id_idx" ON "follow_up_logs"("rule_id");
CREATE INDEX "follow_up_logs_customer_id_idx" ON "follow_up_logs"("customer_id");
ALTER TABLE "follow_up_logs" ADD CONSTRAINT "follow_up_logs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "follow_up_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LineConfig
CREATE TABLE "line_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "channel_id" VARCHAR(50) NOT NULL,
    "channel_secret" VARCHAR(100) NOT NULL,
    "channel_access_token" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "line_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "line_configs_tenant_id_key" ON "line_configs"("tenant_id");
ALTER TABLE "line_configs" ADD CONSTRAINT "line_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ChatMessage
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "direction" VARCHAR(10) NOT NULL,
    "message_type" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "line_message_id" VARCHAR(100),
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_messages_tenant_id_customer_id_idx" ON "chat_messages"("tenant_id", "customer_id");
CREATE INDEX "chat_messages_tenant_id_sent_at_idx" ON "chat_messages"("tenant_id", "sent_at");
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Review
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID,
    "author_name" VARCHAR(100) NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "content" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reviews_tenant_id_is_published_idx" ON "reviews"("tenant_id", "is_published");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PlatformBoost
CREATE TABLE "platform_boosts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "boost_type" VARCHAR(30) NOT NULL,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "platform_boosts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "platform_boosts_tenant_id_idx" ON "platform_boosts"("tenant_id");
CREATE INDEX "platform_boosts_is_active_ends_at_idx" ON "platform_boosts"("is_active", "ends_at");
ALTER TABLE "platform_boosts" ADD CONSTRAINT "platform_boosts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PaidListing (有料掲載院)
CREATE TABLE "paid_listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "postal_code" VARCHAR(10),
    "address" TEXT,
    "latitude" DECIMAL(10, 7),
    "longitude" DECIMAL(10, 7),
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "description" TEXT,
    "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "business_hours_json" JSONB,
    "listing_plan" VARCHAR(20) NOT NULL DEFAULT 'basic',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ,
    "stripe_customer_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "paid_listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "paid_listings_slug_key" ON "paid_listings"("slug");

-- PlatformUser (プラットフォームユーザー)
CREATE TABLE "platform_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "birth_date" DATE,
    "phone" VARCHAR(20),
    "gender" VARCHAR(10),
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_users_user_id_key" ON "platform_users"("user_id");
CREATE UNIQUE INDEX "platform_users_email_key" ON "platform_users"("email");

-- PlatformFavorite
CREATE TABLE "platform_favorites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "platform_user_id" UUID NOT NULL,
    "tenant_id" UUID,
    "paid_listing_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "platform_favorites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_favorites_platform_user_id_tenant_id_key" ON "platform_favorites"("platform_user_id", "tenant_id");
ALTER TABLE "platform_favorites" ADD CONSTRAINT "platform_favorites_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "platform_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PlatformDisclosure (情報開示設定)
CREATE TABLE "platform_disclosures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "platform_user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "disclose_name" BOOLEAN NOT NULL DEFAULT false,
    "disclose_birth_date" BOOLEAN NOT NULL DEFAULT false,
    "disclose_phone" BOOLEAN NOT NULL DEFAULT false,
    "disclose_gender" BOOLEAN NOT NULL DEFAULT false,
    "disclose_carte_data" BOOLEAN NOT NULL DEFAULT false,
    "disclose_visit_history" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "platform_disclosures_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_disclosures_platform_user_id_tenant_id_key" ON "platform_disclosures"("platform_user_id", "tenant_id");
ALTER TABLE "platform_disclosures" ADD CONSTRAINT "platform_disclosures_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "platform_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
