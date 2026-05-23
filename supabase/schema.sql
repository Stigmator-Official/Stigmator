-- STIGMATOR Database Schema
-- Enterprise-grade multi-sided marketplace for tattoo artist apparel

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    instagram_handle TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'artist', 'customer', 'fulfillment')) DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STUDIOS
-- ============================================
CREATE TABLE studios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    instagram_handle TEXT,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ARTIST_STUDIO_LINKS (Artists linked to Studios)
-- ============================================
CREATE TABLE artist_studio_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    studio_id UUID REFERENCES studios(id) ON DELETE CASCADE NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(artist_id, studio_id)
);

-- ============================================
-- FULFILLMENT PARTNERS
-- ============================================
CREATE TABLE fulfillment_partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    business_name TEXT NOT NULL,
    description TEXT,
    specialties TEXT[], -- e.g., ['screen_printing', 'embroidery', 'all_over_print']
    min_order_value INTEGER, -- in cents
    turnaround_days INTEGER,
    rating DECIMAL(3,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT CATEGORIES
-- ============================================
CREATE TABLE product_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS (Garment Templates)
-- ============================================
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES product_categories(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    base_price INTEGER NOT NULL, -- in cents
    sku TEXT UNIQUE,
    images TEXT[],
    sizes TEXT[] DEFAULT '{}',
    colors JSONB DEFAULT '{}',
    design_areas JSONB DEFAULT '{}', -- [{name: "front", x: 0, y: 0, width: 200, height: 300}]
    specifications JSONB DEFAULT '{}', -- material, weight, fit, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DESIGNS (Tattoo Artworks)
-- ============================================
CREATE TABLE designs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    studio_id UUID REFERENCES studios(id),
    title TEXT NOT NULL,
    description TEXT,
    images TEXT[] NOT NULL,
    tags TEXT[],
    style_tags TEXT[], -- e.g., ['traditional', 'blackwork', 'japanese']
    is_original_flash BOOLEAN DEFAULT FALSE, -- if this was existing flash art
    is_exclusive BOOLEAN DEFAULT FALSE, -- if design is exclusive to one customer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT DESIGNS (Design applied to Product)
-- ============================================
CREATE TABLE product_designs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES profiles(id) NOT NULL,
    mockup_images TEXT[] NOT NULL,
    design_placement JSONB NOT NULL, -- {area: "front_left_sleeve", x: 10, y: 20, scale: 1.2, rotation: 0}
    price_override INTEGER, -- in cents, null uses product base_price + artist_markup
    deposit_amount INTEGER NOT NULL, -- in cents (listing fee + mockup fee)
    is_active BOOLEAN DEFAULT TRUE,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES profiles(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending_deposit', 'deposit_paid', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending_deposit',
    
    -- Financial
    subtotal INTEGER NOT NULL, -- in cents
    deposit_amount INTEGER NOT NULL, -- in cents
    shipping_cost INTEGER NOT NULL, -- in cents
    tax_amount INTEGER NOT NULL, -- in cents
    total_amount INTEGER NOT NULL, -- in cents
    
    -- Stripe
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    
    -- Shipping
    shipping_address JSONB NOT NULL,
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_design_id UUID REFERENCES product_designs(id) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    unit_price INTEGER NOT NULL, -- in cents
    total_price INTEGER NOT NULL, -- in cents
    
    -- Fulfillment assignment
    fulfillment_partner_id UUID REFERENCES fulfillment_partners(id),
    fulfillment_status TEXT CHECK (fulfillment_status IN ('unassigned', 'assigned', 'in_production', 'ready_to_ship', 'shipped', 'delivered')) DEFAULT 'unassigned',
    fulfillment_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYOUTS (To Artists and Fulfillment Partners)
-- ============================================
CREATE TABLE payouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES profiles(id) NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('artist', 'fulfillment')),
    order_item_id UUID REFERENCES order_items(id) NOT NULL,
    amount INTEGER NOT NULL, -- in cents
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'paid', 'failed')) DEFAULT 'pending',
    stripe_transfer_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPETITIONS
-- ============================================
CREATE TABLE competitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('monthly_design', 'bracket_tournament', 'ranking_challenge')),
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'voting', 'completed')) DEFAULT 'upcoming',
    
    -- Timeframes
    submission_start TIMESTAMPTZ NOT NULL,
    submission_end TIMESTAMPTZ NOT NULL,
    voting_start TIMESTAMPTZ,
    voting_end TIMESTAMPTZ,
    
    -- Theme/Constraints
    theme TEXT,
    required_product_category UUID REFERENCES product_categories(id),
    
    -- Prizes
    prizes JSONB DEFAULT '[]', -- [{place: 1, description: "Feature on homepage", cash_value: 50000}]
    
    -- Winners
    winner_ids UUID[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPETITION ENTRIES
-- ============================================
CREATE TABLE competition_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES profiles(id) NOT NULL,
    submission_notes TEXT,
    final_rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competition_id, design_id)
);

-- ============================================
-- COMPETITION VOTES
-- ============================================
CREATE TABLE competition_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    entry_id UUID REFERENCES competition_entries(id) ON DELETE CASCADE NOT NULL,
    voter_id UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competition_id, voter_id) -- One vote per competition per user
);

-- ============================================
-- ARTIST RANKINGS (Calculated)
-- ============================================
CREATE TABLE artist_rankings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    period TEXT NOT NULL, -- e.g., '2024-03' or 'all_time'
    
    -- Metrics
    total_sales INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    competition_wins INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Calculated Score
    ranking_score DECIMAL(10,2) DEFAULT 0,
    rank_position INTEGER,
    
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(artist_id, period)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('order_update', 'competition', 'payout', 'verification', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_studios_verification ON studios(verification_status);
CREATE INDEX idx_artist_studio_artist ON artist_studio_links(artist_id);
CREATE INDEX idx_artist_studio_studio ON artist_studio_links(studio_id);
CREATE INDEX idx_designs_artist ON designs(artist_id);
CREATE INDEX idx_product_designs_design ON product_designs(design_id);
CREATE INDEX idx_product_designs_product ON product_designs(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_fulfillment ON order_items(fulfillment_partner_id);
CREATE INDEX idx_payouts_recipient ON payouts(recipient_id);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competition_entries_competition ON competition_entries(competition_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Studios
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Studios are viewable by everyone" 
ON studios FOR SELECT USING (true);

CREATE POLICY "Artists can create studios" 
ON studios FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'artist'));

CREATE POLICY "Studio owners can update studios" 
ON studios FOR UPDATE USING (
    auth.uid() IN (SELECT artist_id FROM artist_studio_links WHERE studio_id = id)
);

-- Artist Studio Links
ALTER TABLE artist_studio_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artist studio links are viewable by everyone" 
ON artist_studio_links FOR SELECT USING (true);

-- Designs
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Designs are viewable by everyone" 
ON designs FOR SELECT USING (true);

CREATE POLICY "Artists can manage own designs" 
ON designs FOR ALL USING (auth.uid() = artist_id);

-- Product Designs
ALTER TABLE product_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product designs are viewable by everyone" 
ON product_designs FOR SELECT USING (true);

CREATE POLICY "Artists can manage own product designs" 
ON product_designs FOR ALL USING (auth.uid() = artist_id);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Artists can view orders containing their designs" 
ON orders FOR SELECT USING (
    auth.uid() IN (
        SELECT d.artist_id FROM designs d
        JOIN product_designs pd ON pd.design_id = d.id
        JOIN order_items oi ON oi.product_design_id = pd.id
        WHERE oi.order_id = orders.id
    )
);

-- Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items for their orders" 
ON order_items FOR SELECT USING (
    auth.uid() IN (SELECT customer_id FROM orders WHERE id = order_id)
);

-- Competitions
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competitions are viewable by everyone" 
ON competitions FOR SELECT USING (true);

-- Competition Entries
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competition entries are viewable by everyone" 
ON competition_entries FOR SELECT USING (true);

CREATE POLICY "Artists can manage own entries" 
ON competition_entries FOR ALL USING (auth.uid() = artist_id);

-- Competition Votes
ALTER TABLE competition_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes" 
ON competition_votes FOR SELECT USING (true);

CREATE POLICY "Users can cast one vote" 
ON competition_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studios_updated_at BEFORE UPDATE ON studios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON designs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'STG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================
-- SEED DATA
-- ============================================

-- Product Categories
INSERT INTO product_categories (name, slug, description, sort_order) VALUES
('T-Shirts', 't-shirts', 'Premium tattoo art on premium cotton', 1),
('Long Sleeve', 'long-sleeve', 'Full sleeve artwork that flows', 2),
('Hoodies', 'hoodies', 'Bold statements in comfort', 3),
('Pants', 'pants', 'From waist to ankle, art everywhere', 4),
('Hats & Beanies', 'headwear', 'Crown your look', 5),
('Socks', 'socks', 'Hidden art for the bold', 6),
('Accessories', 'accessories', 'Scarves, bags, and more', 7),
('Intimates', 'intimates', 'Lingerie with edge', 8);

-- Sample Products
INSERT INTO products (category_id, name, slug, description, base_price, sizes, colors, design_areas) 
SELECT 
    id as category_id,
    'Classic Long Sleeve',
    'classic-long-sleeve',
    'Heavyweight cotton long sleeve, perfect for full sleeve tattoos',
    6500,
    ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    '[{"name": "Black", "hex": "#000000"}, {"name": "White", "hex": "#FFFFFF"}]'::jsonb,
    '[{"name": "left_sleeve", "label": "Left Sleeve", "x": 50, "y": 100, "width": 150, "height": 400}, {"name": "right_sleeve", "label": "Right Sleeve", "x": 300, "y": 100, "width": 150, "height": 400}, {"name": "chest", "label": "Chest", "x": 150, "y": 150, "width": 200, "height": 200}]'::jsonb
FROM product_categories WHERE slug = 'long-sleeve';

INSERT INTO products (category_id, name, slug, description, base_price, sizes, colors, design_areas) 
SELECT 
    id as category_id,
    'Oversized T-Shirt',
    'oversized-t-shirt',
    'Relaxed fit tee for maximum canvas space',
    4500,
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    '[{"name": "Black", "hex": "#000000"}, {"name": "White", "hex": "#FFFFFF"}, {"name": "Natural", "hex": "#F5F5DC"}]'::jsonb,
    '[{"name": "front", "label": "Front", "x": 100, "y": 100, "width": 300, "height": 350}, {"name": "back", "label": "Back", "x": 100, "y": 100, "width": 300, "height": 350}]'::jsonb
FROM product_categories WHERE slug = 't-shirts';

INSERT INTO products (category_id, name, slug, description, base_price, sizes, colors, design_areas) 
SELECT 
    id as category_id,
    'Premium Hoodie',
    'premium-hoodie',
    'Heavyweight hoodie for year-round statement pieces',
    8500,
    ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    '[{"name": "Black", "hex": "#000000"}, {"name": "Charcoal", "hex": "#36454F"}]'::jsonb,
    '[{"name": "front", "label": "Front", "x": 100, "y": 150, "width": 300, "height": 300}, {"name": "back", "label": "Back", "x": 100, "y": 150, "width": 300, "height": 300}, {"name": "left_sleeve", "label": "Left Sleeve", "x": 50, "y": 100, "width": 100, "height": 300}, {"name": "right_sleeve", "label": "Right Sleeve", "x": 350, "y": 100, "width": 100, "height": 300}]'::jsonb
FROM product_categories WHERE slug = 'hoodies';


-- ============================================
-- ARTIST APPROVAL SYSTEM (Added for Directory)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);

-- Index for fast filtering of approved artists
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON profiles(is_approved) WHERE role = 'artist';

