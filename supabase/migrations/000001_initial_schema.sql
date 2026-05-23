-- STIGMATOR Initial Schema Migration
-- Production-ready with RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ARTIST', 'ADMIN', 'FULFILLMENT', 'STUDIO_MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE design_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE garment_type AS ENUM ('TSHIRT', 'LONG_SLEEVE', 'HOODIE', 'TANK_TOP', 'CREWNECK', 'HAT_BEANIE', 'HAT_TRUCKER', 'POSTER', 'STICKER_PACK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'SOLD_OUT', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'PAYMENT_RECEIVED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'DISPUTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'HELD_FOR_REVIEW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partnership_code_status AS ENUM ('GENERATED', 'SENT', 'REDEEMED', 'EXPIRED', 'REVOKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partnership_status AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'TERMINATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    full_name TEXT,
    display_name TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    instagram_handle TEXT,
    role user_role DEFAULT 'CUSTOMER',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'PENDING',
    verified_at TIMESTAMPTZ,
    referral_code TEXT UNIQUE,
    referred_by_id UUID REFERENCES public.users(id),
    email_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Artist Profiles
CREATE TABLE IF NOT EXISTS public.artist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    years_experience INTEGER,
    specialties TEXT[],
    portfolio_url TEXT,
    application_data JSONB,
    reviewed_by_id UUID,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    total_designs INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    default_splits JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Studios
CREATE TABLE IF NOT EXISTS public.studios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website TEXT,
    instagram_handle TEXT,
    verification_status verification_status DEFAULT 'PENDING',
    verification_docs JSONB,
    verified_at TIMESTAMPTZ,
    artist_count INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Studio Members
CREATE TABLE IF NOT EXISTS public.studio_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- OWNER, MANAGER, ARTIST
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(studio_id, user_id)
);

-- Designs
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    description TEXT,
    original_file TEXT NOT NULL,
    preview_image TEXT NOT NULL,
    thumbnail_image TEXT,
    status design_status DEFAULT 'DRAFT',
    category TEXT,
    tags TEXT[],
    is_nsfw BOOLEAN DEFAULT FALSE,
    attribution_required BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Products (Garments)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.users(id),
    studio_id UUID REFERENCES public.studios(id),
    name TEXT NOT NULL,
    description TEXT,
    garment_type garment_type NOT NULL,
    status product_status DEFAULT 'DRAFT',
    base_price INTEGER NOT NULL, -- in cents
    sale_price INTEGER,
    cost_to_produce INTEGER NOT NULL,
    deposit_amount INTEGER DEFAULT 0,
    deposit_recoup_enabled BOOLEAN DEFAULT FALSE,
    deposit_recoup_target_sales INTEGER DEFAULT 0,
    deposit_recouped_amount INTEGER DEFAULT 0,
    deposit_recouped_sales_count INTEGER DEFAULT 0,
    freshness_score INTEGER DEFAULT 0,
    last_sale_at TIMESTAMPTZ,
    inventory_enabled BOOLEAN DEFAULT FALSE,
    inventory_count INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Product Designs (Junction)
CREATE TABLE IF NOT EXISTS public.product_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
    position_x DECIMAL(10, 4) DEFAULT 0,
    position_y DECIMAL(10, 4) DEFAULT 0,
    scale DECIMAL(10, 4) DEFAULT 1,
    rotation DECIMAL(10, 4) DEFAULT 0,
    revenue_share INTEGER DEFAULT 100,
    mockup_image TEXT NOT NULL,
    print_file TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, design_id)
);

-- Partnership Codes
CREATE TABLE IF NOT EXISTS public.partnership_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    artist_id UUID NOT NULL REFERENCES public.users(id),
    design_id UUID NOT NULL REFERENCES public.designs(id),
    artist_share INTEGER NOT NULL,
    partner_share INTEGER NOT NULL,
    studio_share INTEGER DEFAULT 0,
    status partnership_code_status DEFAULT 'GENERATED',
    expires_at TIMESTAMPTZ,
    requires_photo BOOLEAN DEFAULT TRUE,
    requires_location BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ
);

-- Partnerships
CREATE TABLE IF NOT EXISTS public.partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_id UUID UNIQUE NOT NULL REFERENCES public.partnership_codes(id),
    partner_id UUID NOT NULL REFERENCES public.users(id),
    artist_share INTEGER NOT NULL,
    partner_share INTEGER NOT NULL,
    studio_share INTEGER DEFAULT 0,
    status partnership_status DEFAULT 'PENDING_VERIFICATION',
    verification_photo TEXT,
    verification_location JSONB,
    verified_at TIMESTAMPTZ,
    total_sales INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    partner_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ
);

-- Partnership Transactions
CREATE TABLE IF NOT EXISTS public.partnership_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id),
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.users(id),
    customer_email TEXT,
    customer_name TEXT,
    status order_status DEFAULT 'PENDING_PAYMENT',
    subtotal INTEGER NOT NULL,
    tax_amount INTEGER DEFAULT 0,
    shipping_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    shipping_address JSONB,
    shipping_method TEXT,
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    design_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    artist_id TEXT NOT NULL,
    mockup_image TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total INTEGER NOT NULL,
    has_partnership BOOLEAN DEFAULT FALSE,
    production_status TEXT DEFAULT 'PENDING',
    print_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payouts
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    gross_amount INTEGER NOT NULL,
    platform_fees INTEGER NOT NULL,
    tax_withheld INTEGER DEFAULT 0,
    net_amount INTEGER NOT NULL,
    status payout_status DEFAULT 'PENDING',
    stripe_transfer_id TEXT,
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout Items
CREATE TABLE IF NOT EXISTS public.payout_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id),
    gross_amount INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL,
    net_amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.users(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Config
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by_id UUID
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_referral ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by_id);

CREATE INDEX IF NOT EXISTS idx_designs_artist ON public.designs(artist_id);
CREATE INDEX IF NOT EXISTS idx_designs_status ON public.designs(status);
CREATE INDEX IF NOT EXISTS idx_designs_category ON public.designs(category);
CREATE INDEX IF NOT EXISTS idx_designs_tags ON public.designs USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_products_artist ON public.products(artist_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_garment_type ON public.products(garment_type);
CREATE INDEX IF NOT EXISTS idx_products_freshness ON public.products(freshness_score DESC);

CREATE INDEX IF NOT EXISTS idx_partnership_codes_code ON public.partnership_codes(code);
CREATE INDEX IF NOT EXISTS idx_partnership_codes_artist ON public.partnership_codes(artist_id);
CREATE INDEX IF NOT EXISTS idx_partnership_codes_design ON public.partnership_codes(design_id);

CREATE INDEX IF NOT EXISTS idx_partnerships_partner ON public.partnerships(partner_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON public.partnerships(status);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON public.orders(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_payouts_user ON public.payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON public.artist_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_studios_updated_at BEFORE UPDATE ON public.studios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON public.designs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate referral code on user creation
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code = 'STIG-' || UPPER(SUBSTRING(MD5(NEW.id::text), 1, 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code BEFORE INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Log activity function
CREATE OR REPLACE FUNCTION public.log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Artist Profiles policies
CREATE POLICY "Artist profiles are viewable by all" ON public.artist_profiles
    FOR SELECT USING (true);

CREATE POLICY "Artists can update own profile" ON public.artist_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Studios policies
CREATE POLICY "Studios are viewable by all" ON public.studios
    FOR SELECT USING (true);

CREATE POLICY "Studio owners can update" ON public.studios
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.studio_members
            WHERE studio_id = id AND user_id = auth.uid() AND role = 'OWNER'
        )
    );

-- Designs policies
CREATE POLICY "Published designs are viewable by all" ON public.designs
    FOR SELECT USING (status = 'PUBLISHED' OR auth.uid() = artist_id);

CREATE POLICY "Artists can manage own designs" ON public.designs
    FOR ALL USING (auth.uid() = artist_id);

-- Products policies
CREATE POLICY "Active products are viewable by all" ON public.products
    FOR SELECT USING (status = 'ACTIVE' OR auth.uid() = artist_id);

CREATE POLICY "Artists can manage own products" ON public.products
    FOR ALL USING (auth.uid() = artist_id);

-- Partnerships policies
CREATE POLICY "Users can view own partnerships" ON public.partnerships
    FOR SELECT USING (partner_id = auth.uid());

CREATE POLICY "Artists can view partnerships for their codes" ON public.partnerships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.partnership_codes
            WHERE id = code_id AND artist_id = auth.uid()
        )
    );

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Artists can view orders for their products" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.order_items oi
            JOIN public.products p ON oi.product_id = p.id
            WHERE oi.order_id = id AND p.artist_id = auth.uid()
        )
    );

-- Payouts policies
CREATE POLICY "Users can view own payouts" ON public.payouts
    FOR SELECT USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Reviews are viewable by all" ON public.reviews
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own reviews" ON public.reviews
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (customer_id = auth.uid());
