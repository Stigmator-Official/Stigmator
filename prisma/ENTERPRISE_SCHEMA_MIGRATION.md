# STIGMATOR Enterprise Schema Migration Guide

## Overview

This guide explains how to integrate the enterprise database schema additions into your existing STIGMATOR platform.

## Migration Strategy

### Step 1: Backup Your Database
```bash
# Create a backup before any migration
pg_dump -h your-host -U your-user -d your-db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Review Breaking Changes

The following changes need to be made to your existing schema:

#### 1. Update UserRole Enum
**Change from:**
```prisma
enum UserRole {
  CUSTOMER
  ARTIST
  ADMIN
  FULFILLMENT
  STUDIO_MANAGER
}
```

**Change to:**
```prisma
enum UserRole {
  CUSTOMER
  ARTIST
  ADMIN
  SUPER_ADMIN
  DEVELOPER
  FULFILLMENT
  STUDIO_MANAGER
}
```

**SQL Migration:**
```sql
-- PostgreSQL doesn't allow enum modification easily
-- Create new enum and migrate
CREATE TYPE "UserRole_new" AS ENUM ('CUSTOMER', 'ARTIST', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'FULFILLMENT', 'STUDIO_MANAGER');

ALTER TABLE "users" ALTER COLUMN role TYPE "UserRole_new" USING (role::text::"UserRole_new");

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
```

#### 2. Extend Order Model

Add these fields to your existing `Order` model:

```prisma
model Order {
  // ... existing fields ...
  
  // Promo code reference
  promoCodeId       String?         @map("promo_code_id")
  promoCode         PromoCode?      @relation(fields: [promoCodeId], references: [id])
  
  // Enhanced relations
  payment           Payment?
  shipping          Shipping?
  notes             OrderNote[]
  activities        OrderActivity[]
  
  @@index([promoCodeId])
}
```

#### 3. Extend OrderItem Model

Add variant support to `OrderItem`:

```prisma
model OrderItem {
  // ... existing fields ...
  
  // Variant support
  variantId         String?         @map("variant_id")
  variant           ProductVariant? @relation(fields: [variantId], references: [id])
  
  @@index([variantId])
}
```

#### 4. Extend User Model

Add admin relations to `User`:

```prisma
model User {
  // ... existing fields ...
  
  // Admin relations
  adminActions      AdminAction[]
  apiKeys           ApiKey[]
  
  // ... rest of existing fields ...
}
```

### Step 3: Run Migration

#### Option A: Prisma Migrate (Recommended)

```bash
# Merge the schema additions into your main schema.prisma
# Then run:
npx prisma migrate dev --name add_enterprise_schema
```

#### Option B: Manual SQL Migration

Run the SQL in `prisma/migrations/enterprise_additions.sql` (see below).

### Step 4: Verify Migration

```bash
# Validate schema
npx prisma validate

# Generate client
npx prisma generate

# Check database connection
npx prisma db pull --dry-run
```

## Complete SQL Migration Script

```sql
-- =====================================================
-- STIGMATOR ENTERPRISE SCHEMA MIGRATION
-- Run this after backing up your database
-- =====================================================

BEGIN;

-- ============================================
-- EXTENDED ENUMS
-- ============================================

-- Note: Update existing UserRole enum via application layer
-- or create new enum and migrate data

CREATE TYPE "OrderLifecycleStatus" AS ENUM (
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 
  'DELIVERED', 'CANCELLED', 'REFUNDED', 'RETURN_REQUESTED', 'RETURNED'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 
  'REFUNDED', 'PARTIALLY_REFUNDED', 'DISPUTED', 'CANCELLED'
);

CREATE TYPE "PaymentMethod" AS ENUM (
  'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'APPLE_PAY', 
  'GOOGLE_PAY', 'KLARNA', 'AFFIRM', 'BANK_TRANSFER', 'CRYPTO', 'GIFT_CARD'
);

CREATE TYPE "ShippingStatus" AS ENUM (
  'PENDING', 'LABEL_CREATED', 'IN_TRANSIT', 
  'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'RETURN_TO_SENDER'
);

CREATE TYPE "DiscountType" AS ENUM (
  'PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'BUNDLE_DISCOUNT'
);

CREATE TYPE "ProductVisibility" AS ENUM (
  'DRAFT', 'HIDDEN', 'VISIBLE', 'FEATURED', 'EXCLUSIVE'
);

CREATE TYPE "InventoryStatus" AS ENUM (
  'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 
  'BACKORDER', 'DISCONTINUED', 'PREORDER'
);

CREATE TYPE "WebhookEvent" AS ENUM (
  'ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_CANCELLED', 'ORDER_SHIPPED', 
  'ORDER_DELIVERED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PRODUCT_CREATED', 
  'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'USER_REGISTERED', 'USER_UPDATED', 
  'REFUND_PROCESSED', 'INVENTORY_LOW', 'REVIEW_SUBMITTED', 'PARTNERSHIP_REDEEMED'
);

CREATE TYPE "AdminActionType" AS ENUM (
  'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_BANNED', 'USER_UNBANNED',
  'PRODUCT_APPROVED', 'PRODUCT_REJECTED', 'PRODUCT_FEATURED', 'ORDER_REFUNDED',
  'ORDER_CANCELLED', 'PAYOUT_PROCESSED', 'PAYOUT_HELD', 'PROMO_CODE_CREATED',
  'PROMO_CODE_DELETED', 'SETTINGS_UPDATED', 'WEBHOOK_CREATED', 'WEBHOOK_DELETED',
  'API_KEY_CREATED', 'API_KEY_REVOKED', 'DATA_EXPORTED', 'MASS_EMAIL_SENT'
);

CREATE TYPE "ApiPermission" AS ENUM (
  'READ_PRODUCTS', 'WRITE_PRODUCTS', 'READ_ORDERS', 'WRITE_ORDERS',
  'READ_USERS', 'WRITE_USERS', 'READ_ANALYTICS', 'READ_INVENTORY',
  'WRITE_INVENTORY', 'READ_WEBHOOKS', 'WRITE_WEBHOOKS', 'ADMIN_ACCESS'
);

-- ============================================
-- PAYMENT SYSTEM
-- ============================================

CREATE TABLE "payments" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "order_id" TEXT NOT NULL UNIQUE REFERENCES "orders"(id) ON DELETE CASCADE,
  "stripe_payment_intent_id" TEXT UNIQUE,
  "stripe_charge_id" TEXT UNIQUE,
  "stripe_customer_id" TEXT,
  "stripe_refund_id" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "method" "PaymentMethod",
  "amount_authorized" INTEGER NOT NULL DEFAULT 0,
  "amount_captured" INTEGER NOT NULL DEFAULT 0,
  "amount_refunded" INTEGER NOT NULL DEFAULT 0,
  "card_last4" TEXT,
  "card_brand" TEXT,
  "card_expiry_month" INTEGER,
  "card_expiry_year" INTEGER,
  "billing_address" JSONB,
  "failure_code" TEXT,
  "failure_message" TEXT,
  "receipt_url" TEXT,
  "receipt_email" TEXT,
  "authorized_at" TIMESTAMP WITH TIME ZONE,
  "captured_at" TIMESTAMP WITH TIME ZONE,
  "refunded_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_payments_status" ON "payments"("status");
CREATE INDEX "idx_payments_stripe_pi" ON "payments"("stripe_payment_intent_id");
CREATE INDEX "idx_payments_stripe_charge" ON "payments"("stripe_charge_id");
CREATE INDEX "idx_payments_created" ON "payments"("created_at");

CREATE TABLE "refunds" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "payment_id" TEXT NOT NULL REFERENCES "payments"(id) ON DELETE CASCADE,
  "stripe_refund_id" TEXT NOT NULL UNIQUE,
  "amount" INTEGER NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL,
  "processed_by_id" TEXT,
  "notes" TEXT,
  "order_id" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_refunds_payment" ON "refunds"("payment_id");
CREATE INDEX "idx_refunds_order" ON "refunds"("order_id");
CREATE INDEX "idx_refunds_created" ON "refunds"("created_at");

-- ============================================
-- SHIPPING SYSTEM
-- ============================================

CREATE TABLE "shipping" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "order_id" TEXT NOT NULL UNIQUE REFERENCES "orders"(id) ON DELETE CASCADE,
  "carrier" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "tracking_number" TEXT,
  "tracking_url" TEXT,
  "recipient_name" TEXT NOT NULL,
  "address_line1" TEXT NOT NULL,
  "address_line2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'US',
  "postal_code" TEXT NOT NULL,
  "phone" TEXT,
  "cost" INTEGER NOT NULL,
  "insurance_amount" INTEGER,
  "package_weight" FLOAT,
  "package_dimensions" JSONB,
  "status" "ShippingStatus" NOT NULL DEFAULT 'PENDING',
  "label_created_at" TIMESTAMP WITH TIME ZONE,
  "shipped_at" TIMESTAMP WITH TIME ZONE,
  "estimated_delivery" TIMESTAMP WITH TIME ZONE,
  "delivered_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_shipping_status" ON "shipping"("status");
CREATE INDEX "idx_shipping_tracking" ON "shipping"("tracking_number");
CREATE INDEX "idx_shipping_carrier" ON "shipping"("carrier");
CREATE INDEX "idx_shipping_created" ON "shipping"("created_at");

CREATE TABLE "shipping_events" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "shipping_id" TEXT NOT NULL REFERENCES "shipping"(id) ON DELETE CASCADE,
  "status" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT,
  "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_shipping_events_shipping" ON "shipping_events"("shipping_id");
CREATE INDEX "idx_shipping_events_occurred" ON "shipping_events"("occurred_at");

-- ============================================
-- ORDER ENHANCEMENTS
-- ============================================

-- Add promo code reference to orders
ALTER TABLE "orders" ADD COLUMN "promo_code_id" TEXT REFERENCES "promo_codes"(id);
CREATE INDEX "idx_orders_promo_code" ON "orders"("promo_code_id");

CREATE TABLE "order_notes" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "order_id" TEXT NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "is_internal" BOOLEAN NOT NULL DEFAULT true,
  "created_by_id" TEXT,
  "created_by_type" TEXT NOT NULL DEFAULT 'SYSTEM',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_order_notes_order" ON "order_notes"("order_id");
CREATE INDEX "idx_order_notes_created" ON "order_notes"("created_at");

CREATE TABLE "order_activities" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "order_id" TEXT NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "status" "OrderLifecycleStatus" NOT NULL,
  "description" TEXT NOT NULL,
  "actor_id" TEXT,
  "actor_type" TEXT NOT NULL DEFAULT 'SYSTEM',
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_order_activities_order" ON "order_activities"("order_id");
CREATE INDEX "idx_order_activities_status" ON "order_activities"("status");
CREATE INDEX "idx_order_activities_created" ON "order_activities"("created_at");

-- ============================================
-- ANALYTICS SYSTEM
-- ============================================

CREATE TABLE "daily_stats" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "date" DATE NOT NULL UNIQUE,
  "revenue" INTEGER NOT NULL DEFAULT 0,
  "revenue_from_new_customers" INTEGER NOT NULL DEFAULT 0,
  "revenue_from_returning_customers" INTEGER NOT NULL DEFAULT 0,
  "total_orders" INTEGER NOT NULL DEFAULT 0,
  "new_customer_orders" INTEGER NOT NULL DEFAULT 0,
  "returning_customer_orders" INTEGER NOT NULL DEFAULT 0,
  "cancelled_orders" INTEGER NOT NULL DEFAULT 0,
  "refunded_orders" INTEGER NOT NULL DEFAULT 0,
  "visitors" INTEGER NOT NULL DEFAULT 0,
  "unique_visitors" INTEGER NOT NULL DEFAULT 0,
  "page_views" INTEGER NOT NULL DEFAULT 0,
  "add_to_carts" INTEGER NOT NULL DEFAULT 0,
  "checkouts_started" INTEGER NOT NULL DEFAULT 0,
  "conversion_rate" FLOAT NOT NULL DEFAULT 0,
  "average_order_value" INTEGER NOT NULL DEFAULT 0,
  "products_viewed" INTEGER NOT NULL DEFAULT 0,
  "products_sold" INTEGER NOT NULL DEFAULT 0,
  "new_users" INTEGER NOT NULL DEFAULT 0,
  "active_users" INTEGER NOT NULL DEFAULT 0,
  "traffic_sources" JSONB,
  "device_breakdown" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_daily_stats_date" ON "daily_stats"("date");
CREATE INDEX "idx_daily_stats_created" ON "daily_stats"("created_at");

CREATE TABLE "product_analytics" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "product_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "unique_views" INTEGER NOT NULL DEFAULT 0,
  "add_to_carts" INTEGER NOT NULL DEFAULT 0,
  "sales" INTEGER NOT NULL DEFAULT 0,
  "revenue" INTEGER NOT NULL DEFAULT 0,
  "conversion_rate" FLOAT NOT NULL DEFAULT 0,
  "stock_level" INTEGER NOT NULL,
  "views_by_source" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("product_id", "date")
);

CREATE INDEX "idx_product_analytics_product" ON "product_analytics"("product_id");
CREATE INDEX "idx_product_analytics_date" ON "product_analytics"("date");
CREATE INDEX "idx_product_analytics_created" ON "product_analytics"("created_at");

CREATE TABLE "user_analytics" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "sessions" INTEGER NOT NULL DEFAULT 0,
  "session_duration" INTEGER NOT NULL DEFAULT 0,
  "page_views" INTEGER NOT NULL DEFAULT 0,
  "products_viewed" INTEGER NOT NULL DEFAULT 0,
  "designs_created" INTEGER NOT NULL DEFAULT 0,
  "orders_placed" INTEGER NOT NULL DEFAULT 0,
  "amount_spent" INTEGER NOT NULL DEFAULT 0,
  "engagement_score" INTEGER NOT NULL DEFAULT 0,
  "last_device" TEXT,
  "last_location" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("user_id", "date")
);

CREATE INDEX "idx_user_analytics_user" ON "user_analytics"("user_id");
CREATE INDEX "idx_user_analytics_date" ON "user_analytics"("date");
CREATE INDEX "idx_user_analytics_engagement" ON "user_analytics"("engagement_score");

CREATE TABLE "analytics_events" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "event_type" TEXT NOT NULL,
  "event_name" TEXT NOT NULL,
  "user_id" TEXT,
  "session_id" TEXT,
  "entity_type" TEXT,
  "entity_id" TEXT,
  "properties" JSONB,
  "url" TEXT,
  "referrer" TEXT,
  "user_agent" TEXT,
  "ip_address" TEXT,
  "device_type" TEXT,
  "country" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_analytics_events_type" ON "analytics_events"("event_type");
CREATE INDEX "idx_analytics_events_user" ON "analytics_events"("user_id");
CREATE INDEX "idx_analytics_events_entity" ON "analytics_events"("entity_type", "entity_id");
CREATE INDEX "idx_analytics_events_created" ON "analytics_events"("created_at");
CREATE INDEX "idx_analytics_events_session" ON "analytics_events"("session_id");

-- ============================================
-- PROMO CODE SYSTEM
-- ============================================

CREATE TABLE "promo_codes" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" "DiscountType" NOT NULL,
  "value" INTEGER NOT NULL,
  "minimum_order_amount" INTEGER,
  "maximum_discount" INTEGER,
  "usage_limit" INTEGER,
  "usage_limit_per_user" INTEGER,
  "usage_count" INTEGER NOT NULL DEFAULT 0,
  "starts_at" TIMESTAMP WITH TIME ZONE,
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "applicable_products" TEXT[] DEFAULT '{}',
  "excluded_products" TEXT[] DEFAULT '{}',
  "applicable_categories" TEXT[] DEFAULT '{}',
  "new_customers_only" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "created_by_id" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_promo_codes_code" ON "promo_codes"("code");
CREATE INDEX "idx_promo_codes_active" ON "promo_codes"("is_active");
CREATE INDEX "idx_promo_codes_expires" ON "promo_codes"("expires_at");
CREATE INDEX "idx_promo_codes_created" ON "promo_codes"("created_at");

CREATE TABLE "code_usages" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "promo_code_id" TEXT NOT NULL REFERENCES "promo_codes"(id) ON DELETE CASCADE,
  "user_id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "discount_amount" INTEGER NOT NULL,
  "ip_address" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("promo_code_id", "user_id", "order_id")
);

CREATE INDEX "idx_code_usages_code" ON "code_usages"("promo_code_id");
CREATE INDEX "idx_code_usages_user" ON "code_usages"("user_id");
CREATE INDEX "idx_code_usages_order" ON "code_usages"("order_id");
CREATE INDEX "idx_code_usages_created" ON "code_usages"("created_at");

-- ============================================
-- ADMIN & PERMISSIONS
-- ============================================

CREATE TABLE "permissions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "resource" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "conditions" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("resource", "action")
);

CREATE INDEX "idx_permissions_resource" ON "permissions"("resource");

CREATE TABLE "role_permissions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "role" TEXT NOT NULL,
  "permission_id" TEXT NOT NULL REFERENCES "permissions"(id) ON DELETE CASCADE,
  "scope" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("role", "permission_id")
);

CREATE INDEX "idx_role_permissions_role" ON "role_permissions"("role");
CREATE INDEX "idx_role_permissions_permission" ON "role_permissions"("permission_id");

CREATE TABLE "admin_actions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "admin_id" TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "action_type" "AdminActionType" NOT NULL,
  "action" TEXT NOT NULL,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "target_data" JSONB,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "reason" TEXT,
  "is_reverted" BOOLEAN NOT NULL DEFAULT false,
  "reverted_by_id" TEXT,
  "reverted_at" TIMESTAMP WITH TIME ZONE,
  "revert_reason" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_admin_actions_admin" ON "admin_actions"("admin_id");
CREATE INDEX "idx_admin_actions_type" ON "admin_actions"("action_type");
CREATE INDEX "idx_admin_actions_target" ON "admin_actions"("target_type", "target_id");
CREATE INDEX "idx_admin_actions_created" ON "admin_actions"("created_at");

-- ============================================
-- PRODUCT CATALOG ENHANCEMENTS
-- ============================================

CREATE TABLE "product_variants" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "product_id" TEXT NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
  "sku" TEXT NOT NULL UNIQUE,
  "barcode" TEXT UNIQUE,
  "size" TEXT,
  "color" TEXT,
  "color_hex" TEXT,
  "material" TEXT,
  "price_override" INTEGER,
  "weight" FLOAT,
  "dimensions" JSONB,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "images" TEXT[] DEFAULT '{}',
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_product_variants_product" ON "product_variants"("product_id");
CREATE INDEX "idx_product_variants_sku" ON "product_variants"("sku");
CREATE INDEX "idx_product_variants_active" ON "product_variants"("is_active");

-- Add variant reference to order_items
ALTER TABLE "order_items" ADD COLUMN "variant_id" TEXT REFERENCES "product_variants"(id);
CREATE INDEX "idx_order_items_variant" ON "order_items"("variant_id");

CREATE TABLE "inventory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "product_id" TEXT UNIQUE REFERENCES "products"(id) ON DELETE CASCADE,
  "variant_id" TEXT UNIQUE REFERENCES "product_variants"(id) ON DELETE CASCADE,
  "quantity_in_stock" INTEGER NOT NULL DEFAULT 0,
  "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
  "quantity_available" INTEGER NOT NULL DEFAULT 0,
  "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
  "reorder_point" INTEGER,
  "reorder_quantity" INTEGER,
  "status" "InventoryStatus" NOT NULL DEFAULT 'IN_STOCK',
  "last_restocked_at" TIMESTAMP WITH TIME ZONE,
  "next_restock_date" TIMESTAMP WITH TIME ZONE,
  "warehouse_location" TEXT,
  "bin_location" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("product_id" IS NOT NULL OR "variant_id" IS NOT NULL)
);

CREATE INDEX "idx_inventory_status" ON "inventory"("status");
CREATE INDEX "idx_inventory_product" ON "inventory"("product_id");
CREATE INDEX "idx_inventory_variant" ON "inventory"("variant_id");

CREATE TABLE "inventory_history" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "inventory_id" TEXT NOT NULL REFERENCES "inventory"(id) ON DELETE CASCADE,
  "quantity_change" INTEGER NOT NULL,
  "quantity_after" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "reference_id" TEXT,
  "reference_type" TEXT,
  "created_by_id" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_inventory_history_inventory" ON "inventory_history"("inventory_id");
CREATE INDEX "idx_inventory_history_reason" ON "inventory_history"("reason");
CREATE INDEX "idx_inventory_history_created" ON "inventory_history"("created_at");

CREATE TABLE "product_collections" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "image_url" TEXT,
  "banner_url" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "visibility" "ProductVisibility" NOT NULL DEFAULT 'VISIBLE',
  "meta_title" TEXT,
  "meta_description" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_product_collections_slug" ON "product_collections"("slug");
CREATE INDEX "idx_product_collections_active" ON "product_collections"("is_active");
CREATE INDEX "idx_product_collections_order" ON "product_collections"("sort_order");

CREATE TABLE "collection_products" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "collection_id" TEXT NOT NULL REFERENCES "product_collections"(id) ON DELETE CASCADE,
  "product_id" TEXT NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "added_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("collection_id", "product_id")
);

CREATE INDEX "idx_collection_products_collection" ON "collection_products"("collection_id");
CREATE INDEX "idx_collection_products_product" ON "collection_products"("product_id");

-- ============================================
-- WEBHOOKS & API
-- ============================================

CREATE TABLE "webhooks" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "url" TEXT NOT NULL,
  "secret" TEXT NOT NULL,
  "events" "WebhookEvent"[] NOT NULL DEFAULT '{}',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "retry_count" INTEGER NOT NULL DEFAULT 3,
  "timeout_ms" INTEGER NOT NULL DEFAULT 30000,
  "headers" JSONB,
  "metadata" JSONB,
  "created_by_id" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_webhooks_active" ON "webhooks"("is_active");
CREATE INDEX "idx_webhooks_created" ON "webhooks"("created_at");

CREATE TABLE "webhook_deliveries" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "webhook_id" TEXT NOT NULL REFERENCES "webhooks"(id) ON DELETE CASCADE,
  "event_type" "WebhookEvent" NOT NULL,
  "payload" JSONB NOT NULL,
  "request_headers" JSONB,
  "request_body" TEXT,
  "response_status" INTEGER,
  "response_headers" JSONB,
  "response_body" TEXT,
  "duration_ms" INTEGER,
  "status" TEXT NOT NULL,
  "attempt_number" INTEGER NOT NULL DEFAULT 1,
  "max_attempts" INTEGER NOT NULL DEFAULT 3,
  "error_message" TEXT,
  "next_retry_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX "idx_webhook_deliveries_webhook" ON "webhook_deliveries"("webhook_id");
CREATE INDEX "idx_webhook_deliveries_event" ON "webhook_deliveries"("event_type");
CREATE INDEX "idx_webhook_deliveries_status" ON "webhook_deliveries"("status");
CREATE INDEX "idx_webhook_deliveries_created" ON "webhook_deliveries"("created_at");

CREATE TABLE "api_keys" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT NOT NULL,
  "key_hash" TEXT NOT NULL UNIQUE,
  "key_prefix" TEXT NOT NULL,
  "created_by_id" TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "permissions" "ApiPermission"[] NOT NULL DEFAULT '{}',
  "allowed_ips" TEXT[] DEFAULT '{}',
  "allowed_routes" TEXT[] DEFAULT '{}',
  "rate_limit_tier" TEXT NOT NULL DEFAULT 'default',
  "last_used_at" TIMESTAMP WITH TIME ZONE,
  "usage_count" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "revoked_at" TIMESTAMP WITH TIME ZONE,
  "revoked_reason" TEXT,
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_api_keys_created_by" ON "api_keys"("created_by_id");
CREATE INDEX "idx_api_keys_active" ON "api_keys"("is_active");
CREATE INDEX "idx_api_keys_expires" ON "api_keys"("expires_at");
CREATE INDEX "idx_api_keys_created" ON "api_keys"("created_at");

CREATE TABLE "api_key_usage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "api_key_id" TEXT NOT NULL REFERENCES "api_keys"(id) ON DELETE CASCADE,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "status_code" INTEGER NOT NULL,
  "duration_ms" INTEGER NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_api_key_usage_key" ON "api_key_usage"("api_key_id");
CREATE INDEX "idx_api_key_usage_created" ON "api_key_usage"("created_at");

-- ============================================
-- SYSTEM CONFIGURATION
-- ============================================

CREATE TABLE "system_settings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "category" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value_string" TEXT,
  "value_number" FLOAT,
  "value_boolean" BOOLEAN,
  "value_json" JSONB,
  "value_type" TEXT NOT NULL,
  "description" TEXT,
  "is_editable" BOOLEAN NOT NULL DEFAULT true,
  "is_secret" BOOLEAN NOT NULL DEFAULT false,
  "updated_by_id" TEXT,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("category", "key")
);

CREATE INDEX "idx_system_settings_category" ON "system_settings"("category");

CREATE TABLE "email_templates" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT NOT NULL UNIQUE,
  "subject" TEXT NOT NULL,
  "body_html" TEXT NOT NULL,
  "body_text" TEXT,
  "variables" TEXT[] DEFAULT '{}',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "usage_count" INTEGER NOT NULL DEFAULT 0,
  "last_used_at" TIMESTAMP WITH TIME ZONE,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "updated_by_id" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_email_templates_category" ON "email_templates"("category");
CREATE INDEX "idx_email_templates_active" ON "email_templates"("is_active");

-- ============================================
-- AUDIT & COMPLIANCE
-- ============================================

CREATE TABLE "audit_logs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT,
  "user_type" TEXT NOT NULL DEFAULT 'SYSTEM',
  "api_key_id" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resource_id" TEXT,
  "changes" JSONB,
  "metadata" JSONB,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "request_id" TEXT,
  "session_id" TEXT,
  "success" BOOLEAN NOT NULL DEFAULT true,
  "error_message" TEXT,
  "data_sensitivity" TEXT,
  "retention_until" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_audit_logs_user" ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");
CREATE INDEX "idx_audit_logs_resource" ON "audit_logs"("resource", "resource_id");
CREATE INDEX "idx_audit_logs_created" ON "audit_logs"("created_at");
CREATE INDEX "idx_audit_logs_ip" ON "audit_logs"("ip_address");

CREATE TABLE "data_exports" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "requested_by_id" TEXT NOT NULL,
  "entity_types" TEXT[] NOT NULL DEFAULT '{}',
  "filters" JSONB,
  "date_range_start" TIMESTAMP WITH TIME ZONE,
  "date_range_end" TIMESTAMP WITH TIME ZONE,
  "status" TEXT NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "file_url" TEXT,
  "file_size" INTEGER,
  "file_format" TEXT,
  "record_count" INTEGER,
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "error_message" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_data_exports_requested_by" ON "data_exports"("requested_by_id");
CREATE INDEX "idx_data_exports_status" ON "data_exports"("status");
CREATE INDEX "idx_data_exports_created" ON "data_exports"("created_at");

COMMIT;

-- =====================================================
-- POST-MIGRATION DATA SEEDING
-- =====================================================

-- Seed default permissions
INSERT INTO "permissions" ("name", "description", "resource", "action") VALUES
  ('orders:read', 'View orders', 'orders', 'read'),
  ('orders:write', 'Create and update orders', 'orders', 'write'),
  ('orders:delete', 'Delete orders', 'orders', 'delete'),
  ('products:read', 'View products', 'products', 'read'),
  ('products:write', 'Create and update products', 'products', 'write'),
  ('products:delete', 'Delete products', 'products', 'delete'),
  ('users:read', 'View users', 'users', 'read'),
  ('users:write', 'Create and update users', 'users', 'write'),
  ('users:delete', 'Delete users', 'users', 'delete'),
  ('analytics:read', 'View analytics', 'analytics', 'read'),
  ('inventory:read', 'View inventory', 'inventory', 'read'),
  ('inventory:write', 'Update inventory', 'inventory', 'write'),
  ('webhooks:read', 'View webhooks', 'webhooks', 'read'),
  ('webhooks:write', 'Manage webhooks', 'webhooks', 'write'),
  ('admin:access', 'Full admin access', 'admin', 'access')
ON CONFLICT ("name") DO NOTHING;

-- Seed default system settings
INSERT INTO "system_settings" ("category", "key", "value_type", "value_boolean", "description") VALUES
  ('general', 'site_maintenance_mode', 'boolean', false, 'Enable maintenance mode'),
  ('payment', 'stripe_enabled', 'boolean', true, 'Enable Stripe payments'),
  ('shipping', 'default_carrier', 'string', NULL, 'Default shipping carrier'),
  ('notifications', 'order_confirmation_enabled', 'boolean', true, 'Send order confirmation emails')
ON CONFLICT ("category", "key") DO NOTHING;
```

## Post-Migration Steps

### 1. Update Prisma Client

```bash
npx prisma generate
```

### 2. Seed Default Data

```bash
# Run the seed portion of the migration SQL
# Or create a seed script:
```typescript
// prisma/seed-enterprise.ts
import { PrismaClient, UserRole, Permission, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed permissions
  const permissions = [
    { name: 'orders:read', description: 'View orders', resource: 'orders', action: 'read' },
    { name: 'orders:write', description: 'Create and update orders', resource: 'orders', action: 'write' },
    // ... more permissions
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log('Enterprise schema seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 3. Update Application Code

Update your application to use the new models:

```typescript
// Example: Creating an order with payment
const order = await prisma.order.create({
  data: {
    // ... order data ...
    payment: {
      create: {
        amount: 9999,
        currency: 'USD',
        status: 'PENDING',
        method: 'CREDIT_CARD',
      },
    },
    shipping: {
      create: {
        carrier: 'USPS',
        service: 'PRIORITY',
        cost: 899,
        recipientName: 'John Doe',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001',
      },
    },
  },
});
```

## Verification Checklist

- [ ] Database backup created
- [ ] Migration script executed successfully
- [ ] All tables created with proper indexes
- [ ] Foreign key constraints working
- [ ] Prisma client generated without errors
- [ ] Default permissions seeded
- [ ] Application code updated to use new models
- [ ] Unit tests passing
- [ ] Integration tests passing

## Rollback Plan

If issues occur, rollback with:

```sql
-- Drop all new tables (in reverse order of creation)
DROP TABLE IF EXISTS "data_exports" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "email_templates" CASCADE;
DROP TABLE IF EXISTS "system_settings" CASCADE;
DROP TABLE IF EXISTS "api_key_usage" CASCADE;
DROP TABLE IF EXISTS "api_keys" CASCADE;
DROP TABLE IF EXISTS "webhook_deliveries" CASCADE;
DROP TABLE IF EXISTS "webhooks" CASCADE;
DROP TABLE IF EXISTS "collection_products" CASCADE;
DROP TABLE IF EXISTS "product_collections" CASCADE;
DROP TABLE IF EXISTS "inventory_history" CASCADE;
DROP TABLE IF EXISTS "inventory" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "admin_actions" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "code_usages" CASCADE;
DROP TABLE IF EXISTS "promo_codes" CASCADE;
DROP TABLE IF EXISTS "analytics_events" CASCADE;
DROP TABLE IF EXISTS "user_analytics" CASCADE;
DROP TABLE IF EXISTS "product_analytics" CASCADE;
DROP TABLE IF EXISTS "daily_stats" CASCADE;
DROP TABLE IF EXISTS "order_activities" CASCADE;
DROP TABLE IF EXISTS "order_notes" CASCADE;
DROP TABLE IF EXISTS "shipping_events" CASCADE;
DROP TABLE IF EXISTS "shipping" CASCADE;
DROP TABLE IF EXISTS "refunds" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;

-- Remove columns added to existing tables
ALTER TABLE "order_items" DROP COLUMN IF EXISTS "variant_id";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "promo_code_id";

-- Drop new enums
DROP TYPE IF EXISTS "ApiPermission" CASCADE;
DROP TYPE IF EXISTS "AdminActionType" CASCADE;
DROP TYPE IF EXISTS "WebhookEvent" CASCADE;
DROP TYPE IF EXISTS "InventoryStatus" CASCADE;
DROP TYPE IF EXISTS "ProductVisibility" CASCADE;
DROP TYPE IF EXISTS "DiscountType" CASCADE;
DROP TYPE IF EXISTS "ShippingStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "OrderLifecycleStatus" CASCADE;
```

## Support

For issues with this migration, check:
1. PostgreSQL version compatibility (14+)
2. Prisma version compatibility (5.0+)
3. Available disk space for indexes
4. Connection pool limits during migration
