-- Stripe Connect columns on tenants
ALTER TABLE "tenants" ADD COLUMN "stripe_connect_account_id" VARCHAR(255);
ALTER TABLE "tenants" ADD COLUMN "stripe_connect_enabled" BOOLEAN NOT NULL DEFAULT false;

-- Review: add platform_user_id for authenticated reviews
ALTER TABLE "reviews" ADD COLUMN "platform_user_id" UUID;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_platform_user_id_fkey"
  FOREIGN KEY ("platform_user_id") REFERENCES "platform_users"("id") ON DELETE SET NULL;

-- Service Requests (LINE設定代行, Rich Menu制作依頼)
CREATE TABLE "service_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "type" VARCHAR(30) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "form_data" JSONB NOT NULL,
  "note" TEXT,
  "price" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "service_requests_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
);

CREATE INDEX "service_requests_tenant_id_idx" ON "service_requests"("tenant_id");
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");
