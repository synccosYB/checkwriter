ALTER TABLE "users_subscriptions"
  ADD COLUMN IF NOT EXISTS "full_access_override_enabled" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "full_access_override_reason" text,
  ADD COLUMN IF NOT EXISTS "full_access_override_updated_at" timestamp,
  ADD COLUMN IF NOT EXISTS "full_access_override_updated_by" varchar(24);